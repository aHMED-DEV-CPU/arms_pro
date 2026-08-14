import { z } from "zod";

export const localizedStringSchema = z.object({
  en: z.string().trim().min(1, "English version is required"),
  ar: z.string().trim().optional().or(z.literal("")),
});

export const mediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  publicId: z.string().trim().min(1, "Public ID is required"),
});
