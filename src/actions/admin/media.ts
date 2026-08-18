"use server";

import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { deleteAsset } from "@/lib/cloudinary/media";

const apiSecret = process.env.CLOUDINARY_API_SECRET;

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: Admin authentication is required.");
  }
}

export type ResourceCategory = "services" | "projects" | "partners" | "company";

/**
 * Generates a signed token for uploading files directly to Cloudinary.
 * Maps category keys to pre-defined Cloudinary folder paths for security.
 */
export async function getUploadSignature(category: ResourceCategory) {
  await requireAuth();

  const folderMap: Record<ResourceCategory, string> = {
    services: "arms-pro/services",
    projects: "arms-pro/projects",
    partners: "arms-pro/partners",
    company: "arms-pro/company",
  };

  const folder = folderMap[category];
  if (!folder) {
    throw new Error("Invalid resource category mapping.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Cloudinary signature parameters MUST exactly match client parameters
  const params = {
    timestamp,
    folder,
  };

  if (!apiSecret) {
    throw new Error("Missing Cloudinary configuration: API Secret.");
  }

  // Generate signature using secure server-only API Secret
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "video") {
  await requireAuth();
  return await deleteAsset(publicId, resourceType);
}
