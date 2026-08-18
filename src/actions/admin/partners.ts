"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Partner from "@/models/Partner";
import { partnerValidationSchema } from "@/lib/validations/partner";
import { deleteAsset } from "@/lib/cloudinary/media";

/**
 * Asserts that the caller is authenticated as an Admin.
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Authentication is required.");
  }
}

export async function createPartner(formData: FormData) {
  await requireAuth();
  await dbConnect();

  let newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];

  try {
    const dataStr = formData.get("data") as string;
    const newMediaStr = formData.get("newlyUploadedMedia") as string;

    if (newMediaStr) {
      newlyUploadedMedia = JSON.parse(newMediaStr);
    }

    if (!dataStr) {
      for (const item of newlyUploadedMedia) {
        await deleteAsset(item.publicId, item.resourceType);
      }
      return { success: false, error: "No partner data provided." };
    }

    const rawData = JSON.parse(dataStr);

    // Zod validation
    const validated = partnerValidationSchema.parse(rawData);

    // Create partner
    await Partner.create(validated);

    // Revalidate paths (Partners Slider is on Home page)
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to create partner:", err);
    // Rollback: cleanup the newly uploaded assets on database error
    for (const item of newlyUploadedMedia) {
      try {
        await deleteAsset(item.publicId, item.resourceType);
      } catch (rollbackErr) {
        console.error("Rollback cleanup failed for:", item.publicId, rollbackErr);
      }
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function updatePartner(id: string, formData: FormData) {
  await requireAuth();
  await dbConnect();

  let newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];

  try {
    const dataStr = formData.get("data") as string;
    const newMediaStr = formData.get("newlyUploadedMedia") as string;

    if (newMediaStr) {
      newlyUploadedMedia = JSON.parse(newMediaStr);
    }

    if (!dataStr) {
      for (const item of newlyUploadedMedia) {
        await deleteAsset(item.publicId, item.resourceType);
      }
      return { success: false, error: "No partner data provided." };
    }

    const rawData = JSON.parse(dataStr);
    const existingPartner = await Partner.findById(id);
    if (!existingPartner) {
      for (const item of newlyUploadedMedia) {
        await deleteAsset(item.publicId, item.resourceType);
      }
      return { success: false, error: "Partner not found." };
    }

    // Determine old assets to delete ONLY after successful save
    const oldAssetsToDelete: { publicId: string; resourceType: "image" | "video" }[] = [];
    if (rawData.logo && existingPartner.logo?.publicId && rawData.logo.publicId !== existingPartner.logo.publicId) {
      oldAssetsToDelete.push({ publicId: existingPartner.logo.publicId, resourceType: "image" });
    }

    // Zod validation
    const validated = partnerValidationSchema.parse(rawData);

    // Update partner
    await Partner.findByIdAndUpdate(id, validated);

    // Delete the OLD assets only after MongoDB update succeeds
    for (const item of oldAssetsToDelete) {
      console.log("Deleting old replaced partner logo from Cloudinary:", item.publicId);
      await deleteAsset(item.publicId, item.resourceType);
    }

    // Revalidate Home page
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to update partner:", err);
    // Rollback: cleanup the newly uploaded assets on database error
    for (const item of newlyUploadedMedia) {
      try {
        await deleteAsset(item.publicId, item.resourceType);
      } catch (rollbackErr) {
        console.error("Rollback cleanup failed for:", item.publicId, rollbackErr);
      }
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function deletePartner(id: string) {
  await requireAuth();
  await dbConnect();

  try {
    const partner = await Partner.findById(id);
    if (!partner) {
      return { success: false, error: "Partner not found." };
    }

    // Delete logo from Cloudinary
    if (partner.logo?.publicId) {
      console.log("Deleting partner logo from Cloudinary...");
      const res = await deleteAsset(partner.logo.publicId, "image");
      if (!res.success) {
        console.warn(`Warning: Logo could not be deleted from Cloudinary: ${res.error}`);
      }
    }

    // Delete from MongoDB
    await Partner.findByIdAndDelete(id);

    // Revalidate Home page
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete partner:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function togglePartnerActive(id: string, active: boolean) {
  await requireAuth();
  await dbConnect();

  try {
    const partner = await Partner.findByIdAndUpdate(id, { active }, { new: true });
    if (!partner) {
      return { success: false, error: "Partner not found." };
    }

    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle partner status:", err);
    return { success: false, error: "Failed to toggle partner status." };
  }
}
