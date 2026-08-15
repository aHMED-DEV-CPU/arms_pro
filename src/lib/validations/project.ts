import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

export const projectValidationSchema = z.object({
  title: localizedStringSchema,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  category: localizedStringSchema,
  shortDescription: localizedStringSchema,
  fullDescription: localizedStringSchema,
  coverImage: mediaSchema,
  gallery: z.array(mediaSchema).default([]),
  video: mediaSchema.optional(),
  featured: z.boolean().default(false),
  status: z.enum(["completed", "in-progress", "upcoming", "on-hold"]).default("completed"),
  displayOrder: z.number().int().min(0).default(0),
});

export type ProjectValidationValues = z.infer<typeof projectValidationSchema>;
