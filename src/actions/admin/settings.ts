"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import CompanySettings from "@/models/CompanySettings";
import { companySettingsValidationSchema } from "@/lib/validations/company-settings";
import { uploadAsset, deleteAsset } from "@/lib/cloudinary/media";

/**
 * Asserts that the caller is authenticated as an Admin.
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Authentication is required.");
  }
}

export async function updateCompanySettings(formData: FormData) {
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
      return { success: false, error: "No settings data provided." };
    }

    const rawData = JSON.parse(dataStr);
    let settings = await CompanySettings.findOne();
    if (!settings) {
      // If missing, initialize an empty one
      settings = new CompanySettings({});
    }

    // Determine old assets to delete ONLY after successful save
    const oldAssetsToDelete: { publicId: string; resourceType: "image" | "video" }[] = [];

    // Compare logo
    if (rawData.logo && settings.logo?.publicId && rawData.logo.publicId !== settings.logo.publicId) {
      oldAssetsToDelete.push({ publicId: settings.logo.publicId, resourceType: "image" });
    } else if (!rawData.logo && settings.logo?.publicId) {
      oldAssetsToDelete.push({ publicId: settings.logo.publicId, resourceType: "image" });
    }

    // Compare heroImage
    if (rawData.heroImage && settings.heroImage?.publicId && rawData.heroImage.publicId !== settings.heroImage.publicId) {
      oldAssetsToDelete.push({ publicId: settings.heroImage.publicId, resourceType: "image" });
    } else if (!rawData.heroImage && settings.heroImage?.publicId) {
      oldAssetsToDelete.push({ publicId: settings.heroImage.publicId, resourceType: "image" });
    }

    // Compare aboutImage
    if (rawData.aboutImage && settings.aboutImage?.publicId && rawData.aboutImage.publicId !== settings.aboutImage.publicId) {
      oldAssetsToDelete.push({ publicId: settings.aboutImage.publicId, resourceType: "image" });
    } else if (!rawData.aboutImage && settings.aboutImage?.publicId) {
      oldAssetsToDelete.push({ publicId: settings.aboutImage.publicId, resourceType: "image" });
    }

    // Zod validation (will run preprocessors and transforms)
    const validated = companySettingsValidationSchema.parse(rawData);

    // 2. Attempt MongoDB update
    try {
      if (settings.isNew) {
        await CompanySettings.create(validated);
      } else {
        await CompanySettings.findByIdAndUpdate(settings._id, validated);
      }
    } catch (dbError) {
      // Rollback: cleanup the newly uploaded assets on database error
      for (const item of newlyUploadedMedia) {
        console.log("Cleaning up newly uploaded asset on failure:", item.publicId);
        await deleteAsset(item.publicId, item.resourceType);
      }
      throw dbError;
    }

    // 3. Delete the OLD assets only after MongoDB update succeeds
    for (const item of oldAssetsToDelete) {
      console.log("Deleting old replaced settings asset from Cloudinary:", item.publicId);
      await deleteAsset(item.publicId, item.resourceType);
    }

    // Revalidate pages using logo, hero, about section, text content, and social links
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");

    return { success: true };
  } catch (err) {
    console.error("Failed to update company settings:", err);
    // Safety check fallback rollback if not caught inside the db try-catch
    for (const item of newlyUploadedMedia) {
      try {
        await deleteAsset(item.publicId, item.resourceType);
      } catch (rollbackErr) {
        console.error("Rollback cleanup failed for:", item.publicId, rollbackErr);
      }
    }
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
