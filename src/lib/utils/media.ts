import { readdir } from "node:fs/promises";
import path from "node:path";

const publicDirectory = path.join(process.cwd(), "public");
const imageExtensions = new Set([".avif", ".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".webm", ".mov"]);

export type PublicMediaFile = {
  name: string;
  src: string;
};

export function publicPath(...segments: string[]) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

export async function getPublicImageFiles(...segments: string[]) {
  return getPublicMediaFiles(segments, imageExtensions);
}

export async function getPublicVideoFiles(...segments: string[]) {
  return getPublicMediaFiles(segments, videoExtensions);
}

export function labelFromFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getPublicMediaFiles(
  segments: string[],
  allowedExtensions: Set<string>,
) {
  try {
    const directory = path.join(publicDirectory, ...segments);
    const entries = await readdir(directory, { withFileTypes: true });

    return entries
      .filter((entry) => {
        const extension = path.extname(entry.name).toLowerCase();
        return entry.isFile() && allowedExtensions.has(extension);
      })
      .sort((first, second) => sortMediaNames(first.name, second.name))
      .map((entry) => ({
        name: entry.name,
        src: publicPath(...segments, entry.name),
      }));
  } catch {
    return [];
  }
}

function sortMediaNames(first: string, second: string) {
  if (first === "cover.webp") return -1;
  if (second === "cover.webp") return 1;

  return first.localeCompare(second, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
