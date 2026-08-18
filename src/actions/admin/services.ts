"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";
import { servicePersistedSchema } from "@/lib/validations/service";
import { deleteAsset, uploadAsset, replaceAsset } from "@/lib/cloudinary/media";
import { Media } from "@/types";

/**
 * Asserts that the caller is authenticated as an Admin.
 */
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Authentication is required.");
  }
}

/**
 * Normalizes service displayOrder values to 1, 2, 3...
 */
async function normalizeDisplayOrders() {
  const services = await Service.find({}).sort({ displayOrder: 1, createdAt: 1 });
  for (let i = 0; i < services.length; i++) {
    services[i].displayOrder = i + 1;
    await services[i].save();
  }
}

export async function createService(formData: FormData) {
  await requireAuth();
  await dbConnect();

  const dataStr = formData.get("data") as string;
  const newMediaStr = formData.get("newlyUploadedMedia") as string;
  
  const newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = newMediaStr
    ? JSON.parse(newMediaStr)
    : [];

  const cleanupNewAssets = async () => {
    for (const item of newlyUploadedMedia) {
      console.log("Cleaning up newly uploaded asset on failure:", item.publicId);
      await deleteAsset(item.publicId, item.resourceType);
    }
  };

  try {
    if (!dataStr) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "server",
        message: "No service data provided.",
      };
    }

    const rawData = JSON.parse(dataStr);

    // Calculate max displayOrder
    const maxItem = await Service.findOne({}).sort({ displayOrder: -1 }).select("displayOrder");
    const nextOrder = maxItem ? (maxItem.displayOrder || 0) + 1 : 1;

    const values = {
      ...rawData,
      displayOrder: nextOrder,
    };

    // Zod validation on database document structure
    const validated = servicePersistedSchema.parse(values);

    // Check slug uniqueness
    const existing = await Service.findOne({ slug: validated.slug });
    if (existing) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "conflict",
        message: `Slug "${validated.slug}" already exists.`,
      };
    }

    // Create service
    const service = await Service.create(validated);

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);

    return { success: true, serviceId: String(service._id), slug: service.slug };
  } catch (err) {
    console.error("Failed to create service:", err);
    await cleanupNewAssets();

    if (err instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      err.issues.forEach((e) => {
        fieldErrors[e.path.join(".")] = e.message;
      });
      return {
        success: false,
        type: "validation",
        message: "Please complete the required fields.",
        fieldErrors,
      };
    }
    return {
      success: false,
      type: "server",
      message: err instanceof Error ? err.message : "Unable to create service.",
    };
  }
}

export async function updateService(id: string, formData: FormData) {
  await requireAuth();
  await dbConnect();

  const dataStr = formData.get("data") as string;
  const newMediaStr = formData.get("newlyUploadedMedia") as string;
  const replacedMediaStr = formData.get("replacedMedia") as string;

  const newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = newMediaStr
    ? JSON.parse(newMediaStr)
    : [];
  const replacedMedia: { publicId: string; resourceType: "image" | "video" }[] = replacedMediaStr
    ? JSON.parse(replacedMediaStr)
    : [];

  const cleanupNewAssets = async () => {
    for (const item of newlyUploadedMedia) {
      console.log("Cleaning up newly uploaded asset on failure:", item.publicId);
      await deleteAsset(item.publicId, item.resourceType);
    }
  };

  try {
    if (!dataStr) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "server",
        message: "No service data provided.",
      };
    }

    const rawData = JSON.parse(dataStr);
    const existingService = await Service.findById(id);
    if (!existingService) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "server",
        message: "Service not found.",
      };
    }

    const oldSlug = existingService.slug;

    // Check slug uniqueness if changed
    if (rawData.slug !== existingService.slug) {
      const duplicate = await Service.findOne({ slug: rawData.slug, _id: { $ne: id } });
      if (duplicate) {
        await cleanupNewAssets();
        return {
          success: false,
          type: "conflict",
          message: `Slug "${rawData.slug}" is already in use.`,
        };
      }
    }

    const values = {
      ...rawData,
      displayOrder: existingService.displayOrder || 0,
    };

    // Zod validation on database document structure
    const validated = servicePersistedSchema.parse(values);

    // Determine old assets to delete ONLY after successful save
    const oldAssetsToDelete: { publicId: string; resourceType: "image" | "video" }[] = [];

    // 1. Cover Image replacement
    if (validated.coverImage && existingService.coverImage?.publicId && validated.coverImage.publicId !== existingService.coverImage.publicId) {
      oldAssetsToDelete.push({ publicId: existingService.coverImage.publicId, resourceType: "image" });
    }

    // 2. Video replacement or removal
    const updateQuery: any = { ...validated };
    if (validated.video === null) {
      updateQuery.$unset = { video: 1 };
      delete updateQuery.video;
      if (existingService.video?.publicId) {
        oldAssetsToDelete.push({ publicId: existingService.video.publicId, resourceType: "video" });
      }
    } else if (validated.video && existingService.video?.publicId && validated.video.publicId !== existingService.video.publicId) {
      oldAssetsToDelete.push({ publicId: existingService.video.publicId, resourceType: "video" });
    }

    // 3. Gallery items deletion detection
    const remainingGalleryIds = new Set((validated.gallery || []).map((item) => item.publicId));
    for (const item of existingService.gallery || []) {
      if (item?.publicId && !remainingGalleryIds.has(item.publicId)) {
        oldAssetsToDelete.push({ publicId: item.publicId, resourceType: "image" });
      }
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(id, updateQuery, { new: true });

    // Success commit: Clean up replaced/removed media assets from Cloudinary
    for (const item of oldAssetsToDelete) {
      console.log("Deleting old replaced/removed service asset from Cloudinary:", item.publicId);
      const res = await deleteAsset(item.publicId, item.resourceType);
      if (!res.success) {
        console.warn(`Warning: Replaced/removed asset could not be deleted from Cloudinary: ${res.error}`);
      }
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${oldSlug}`);
    if (updatedService && updatedService.slug !== oldSlug) {
      revalidatePath(`/services/${updatedService.slug}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to update service:", err);
    await cleanupNewAssets();

    if (err instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      err.issues.forEach((e) => {
        fieldErrors[e.path.join(".")] = e.message;
      });
      return {
        success: false,
        type: "validation",
        message: "Please complete the required fields.",
        fieldErrors,
      };
    }
    return {
      success: false,
      type: "server",
      message: err instanceof Error ? err.message : "Unable to update service.",
    };
  }
}

export async function deleteService(id: string) {
  await requireAuth();
  await dbConnect();

  try {
    const service = await Service.findById(id);
    if (!service) {
      return { success: false, error: "Service not found." };
    }

    const slug = service.slug;
    const errors: string[] = [];

    // Delete Cloudinary cover
    if (service.coverImage?.publicId) {
      console.log("Deleting cover image from Cloudinary...");
      const res = await deleteAsset(service.coverImage.publicId, "image");
      if (!res.success) {
        errors.push(`Cover image: ${res.error}`);
      }
    }

    // Delete Cloudinary gallery
    for (const item of service.gallery || []) {
      if (item.publicId) {
        console.log(`Deleting gallery image ${item.publicId} from Cloudinary...`);
        const res = await deleteAsset(item.publicId, "image");
        if (!res.success) {
          errors.push(`Gallery item ${item.publicId}: ${res.error}`);
        }
      }
    }

    // Delete Cloudinary video
    if (service.video?.publicId) {
      console.log("Deleting video from Cloudinary...");
      const res = await deleteAsset(service.video.publicId, "video");
      if (!res.success) {
        errors.push(`Video: ${res.error}`);
      }
    }

    // Delete from MongoDB
    await Service.findByIdAndDelete(id);

    // Normalize display orders
    await normalizeDisplayOrders();

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${slug}`);

    if (errors.length > 0) {
      return {
        success: true,
        warning: `Database entry deleted, but some Cloudinary assets could not be removed: ${errors.join(", ")}`,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to delete service:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function toggleServiceFeatured(id: string, featured: boolean) {
  await requireAuth();
  await dbConnect();

  try {
    const service = await Service.findByIdAndUpdate(id, { featured }, { new: true });
    if (!service) {
      return { success: false, error: "Service not found." };
    }

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle service featured status:", err);
    return { success: false, error: "Failed to toggle featured status." };
  }
}

export async function toggleServiceStatus(id: string, status: "draft" | "published") {
  await requireAuth();
  await dbConnect();

  try {
    const service = await Service.findByIdAndUpdate(id, { status }, { new: true });
    if (!service) {
      return { success: false, error: "Service not found." };
    }

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle service status:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function reorderServices(ids: string[]) {
  await requireAuth();
  await dbConnect();

  try {
    // Perform bulk displayOrder updates
    for (let i = 0; i < ids.length; i++) {
      await Service.findByIdAndUpdate(ids[i], { displayOrder: i + 1 });
    }

    revalidatePath("/");
    revalidatePath("/services");

    return { success: true };
  } catch (err) {
    console.error("Failed to reorder services:", err);
    return { success: false, error: "Failed to reorder services." };
  }
}
