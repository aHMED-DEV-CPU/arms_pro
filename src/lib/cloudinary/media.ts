import "server-only";
import cloudinary from "./cloudinary";
import { Media } from "@/types";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export const FOLDER_MAP = {
  services: "arms-pro/services",
  projects: "arms-pro/projects",
  partners: "arms-pro/partners",
  company: "arms-pro/company",
};

/**
 * Custom error thrown when the new asset was uploaded successfully,
 * but the old asset could not be deleted from Cloudinary.
 */
export class ReplaceCleanupError extends Error {
  public newMedia: Media;
  public oldPublicId: string;

  constructor(message: string, newMedia: Media, oldPublicId: string) {
    super(message);
    this.name = "ReplaceCleanupError";
    this.newMedia = newMedia;
    this.oldPublicId = oldPublicId;
  }
}

/**
 * Validates file type and size.
 */
export function validateFile(file: File, resourceType: "image" | "video") {
  if (resourceType === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Invalid image type: ${file.type}. Allowed: JPEG, PNG, WEBP.`);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image exceeds maximum allowed size of 10MB (Current: ${(file.size / 1024 / 1024).toFixed(2)}MB).`);
    }
  } else if (resourceType === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error(`Invalid video type: ${file.type}. Allowed: MP4, WEBM, QUICKTIME.`);
    }
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video exceeds maximum allowed size of 100MB (Current: ${(file.size / 1024 / 1024).toFixed(2)}MB).`);
    }
  } else {
    throw new Error("Invalid resource type specified.");
  }
}

/**
 * Uploads an asset (image or video) to Cloudinary.
 */
export async function uploadAsset(
  file: File,
  folderKey: keyof typeof FOLDER_MAP,
  resourceType: "image" | "video" = "image"
): Promise<Media> {
  validateFile(file, resourceType);

  const folder = FOLDER_MAP[folderKey];
  if (!folder) {
    throw new Error("Invalid folder key mapping.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<Media>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || "Cloudinary upload failed"));
        }
        if (!result) {
          return reject(new Error("Cloudinary upload failed: Empty result"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Deletes an asset from Cloudinary using its publicId.
 */
export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (response.result === "ok") {
      return { success: true, result: response.result };
    } else if (response.result === "not found") {
      return { success: false, error: "Asset not found on Cloudinary" };
    }

    return { success: false, error: response.result || "Deletion failed" };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMessage };
  }
}

/**
 * Safely replaces an old asset with a new one.
 * Uploads the new asset first, and only deletes the old one upon success.
 */
export async function replaceAsset(
  newFile: File,
  oldPublicId: string | null | undefined,
  folderKey: keyof typeof FOLDER_MAP,
  resourceType: "image" | "video" = "image"
): Promise<Media> {
  // 1. Upload new asset
  const newMedia = await uploadAsset(newFile, folderKey, resourceType);

  // 2. If no old asset, return new media immediately
  if (!oldPublicId) {
    return newMedia;
  }

  // 3. Delete old asset with cache invalidation
  const deleteResult = await deleteAsset(oldPublicId, resourceType);
  if (!deleteResult.success) {
    throw new ReplaceCleanupError(
      `New asset uploaded successfully, but old asset deletion failed: ${deleteResult.error}`,
      newMedia,
      oldPublicId
    );
  }

  return newMedia;
}
