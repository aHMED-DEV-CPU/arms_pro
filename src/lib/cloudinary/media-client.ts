/**
 * Client-safe helper to upload files directly to Cloudinary using signed signatures.
 * Uses XMLHttpRequest to provide real-time progress callbacks.
 */
export function uploadFileWithProgress(
  file: File,
  signatureData: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
  },
  resourceType: "image" | "video" = "image",
  onProgress?: (percent: number) => void
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;

    xhr.open("POST", url, true);

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
          });
        } catch {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error?.message || "Cloudinary upload failed."));
        } catch {
          reject(new Error("Cloudinary upload failed."));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error uploading file to Cloudinary."));
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("signature", signatureData.signature);
    formData.append("folder", signatureData.folder);

    xhr.send(formData);
  });
}
