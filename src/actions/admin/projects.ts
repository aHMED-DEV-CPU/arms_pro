"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { projectPersistedSchema } from "@/lib/validations/project";
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
 * Normalizes project displayOrder values to 1, 2, 3...
 */
async function normalizeDisplayOrders() {
  const projects = await Project.find({}).sort({ displayOrder: 1, createdAt: 1 });
  for (let i = 0; i < projects.length; i++) {
    projects[i].displayOrder = i + 1;
    await projects[i].save();
  }
}

export async function createProject(formData: FormData) {
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
        message: "No project data provided.",
      };
    }

    const rawData = JSON.parse(dataStr);

    // Calculate max displayOrder
    const maxItem = await Project.findOne({}).sort({ displayOrder: -1 }).select("displayOrder");
    const nextOrder = maxItem ? (maxItem.displayOrder || 0) + 1 : 1;

    const values = {
      ...rawData,
      displayOrder: nextOrder,
    };

    // Zod validation on database document structure
    const validated = projectPersistedSchema.parse(values);

    // Check slug uniqueness
    const existing = await Project.findOne({ slug: validated.slug });
    if (existing) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "conflict",
        message: `Slug "${validated.slug}" already exists.`,
      };
    }

    // Create project
    const project = await Project.create(validated);

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);

    return { success: true, projectId: String(project._id), slug: project.slug };
  } catch (err) {
    console.error("Failed to create project:", err);
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
      message: err instanceof Error ? err.message : "Unable to create project.",
    };
  }
}

export async function updateProject(id: string, formData: FormData) {
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
        message: "No project data provided.",
      };
    }

    const rawData = JSON.parse(dataStr);
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      await cleanupNewAssets();
      return {
        success: false,
        type: "server",
        message: "Project not found.",
      };
    }

    const oldSlug = existingProject.slug;

    // Check slug uniqueness if changed
    if (rawData.slug !== existingProject.slug) {
      const duplicate = await Project.findOne({ slug: rawData.slug, _id: { $ne: id } });
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
      displayOrder: existingProject.displayOrder || 0,
    };

    // Zod validation on database document structure
    const validated = projectPersistedSchema.parse(values);

    // Determine old assets to delete ONLY after successful save
    const oldAssetsToDelete: { publicId: string; resourceType: "image" | "video" }[] = [];

    // 1. Cover Image replacement
    if (validated.coverImage && existingProject.coverImage?.publicId && validated.coverImage.publicId !== existingProject.coverImage.publicId) {
      oldAssetsToDelete.push({ publicId: existingProject.coverImage.publicId, resourceType: "image" });
    }

    // 2. Video replacement or removal
    const updateQuery: any = { ...validated };
    if (validated.video === null) {
      updateQuery.$unset = { video: 1 };
      delete updateQuery.video;
      if (existingProject.video?.publicId) {
        oldAssetsToDelete.push({ publicId: existingProject.video.publicId, resourceType: "video" });
      }
    } else if (validated.video && existingProject.video?.publicId && validated.video.publicId !== existingProject.video.publicId) {
      oldAssetsToDelete.push({ publicId: existingProject.video.publicId, resourceType: "video" });
    }

    // 3. Gallery items deletion detection
    const remainingGalleryIds = new Set((validated.gallery || []).map((item) => item.publicId));
    for (const item of existingProject.gallery || []) {
      if (item?.publicId && !remainingGalleryIds.has(item.publicId)) {
        oldAssetsToDelete.push({ publicId: item.publicId, resourceType: "image" });
      }
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(id, updateQuery, { new: true });

    // Success commit: Clean up replaced/removed media assets from Cloudinary
    for (const item of oldAssetsToDelete) {
      console.log("Deleting old replaced/removed project asset from Cloudinary:", item.publicId);
      const res = await deleteAsset(item.publicId, item.resourceType);
      if (!res.success) {
        console.warn(`Warning: Replaced/removed asset could not be deleted from Cloudinary: ${res.error}`);
      }
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${oldSlug}`);
    if (updatedProject && updatedProject.slug !== oldSlug) {
      revalidatePath(`/projects/${updatedProject.slug}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to update project:", err);
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
      message: err instanceof Error ? err.message : "Unable to update project.",
    };
  }
}

export async function deleteProject(id: string) {
  await requireAuth();
  await dbConnect();

  try {
    const project = await Project.findById(id);
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const slug = project.slug;
    const errors: string[] = [];

    // Delete Cloudinary cover
    if (project.coverImage?.publicId) {
      console.log("Deleting cover image from Cloudinary...");
      const res = await deleteAsset(project.coverImage.publicId, "image");
      if (!res.success) {
        errors.push(`Cover image: ${res.error}`);
      }
    }

    // Delete Cloudinary gallery
    for (const item of project.gallery || []) {
      if (item.publicId) {
        console.log(`Deleting gallery image ${item.publicId} from Cloudinary...`);
        const res = await deleteAsset(item.publicId, "image");
        if (!res.success) {
          errors.push(`Gallery item ${item.publicId}: ${res.error}`);
        }
      }
    }

    // Delete Cloudinary video
    if (project.video?.publicId) {
      console.log("Deleting video from Cloudinary...");
      const res = await deleteAsset(project.video.publicId, "video");
      if (!res.success) {
        errors.push(`Video: ${res.error}`);
      }
    }

    // Delete from MongoDB
    await Project.findByIdAndDelete(id);

    // Normalize display orders
    await normalizeDisplayOrders();

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${slug}`);

    if (errors.length > 0) {
      return {
        success: true,
        warning: `Database entry deleted, but some Cloudinary assets could not be removed: ${errors.join(", ")}`,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to delete project:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function toggleProjectFeatured(id: string, featured: boolean) {
  await requireAuth();
  await dbConnect();

  try {
    const project = await Project.findByIdAndUpdate(id, { featured }, { new: true });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle project featured status:", err);
    return { success: false, error: "Failed to toggle featured status." };
  }
}

export async function reorderProjects(ids: string[]) {
  await requireAuth();
  await dbConnect();

  try {
    // Perform bulk displayOrder updates
    for (let i = 0; i < ids.length; i++) {
      await Project.findByIdAndUpdate(ids[i], { displayOrder: i + 1 });
    }

    revalidatePath("/");
    revalidatePath("/projects");

    return { success: true };
  } catch (err) {
    console.error("Failed to reorder projects:", err);
    return { success: false, error: "Failed to reorder projects." };
  }
}
