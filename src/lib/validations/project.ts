import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

export const projectBaseSchema = z.object({
  title: localizedStringSchema,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  category: localizedStringSchema,
  shortDescription: localizedStringSchema,
  fullDescription: localizedStringSchema,
  featured: z.boolean().default(false),
  status: z.enum(["completed", "in-progress", "upcoming", "on-hold"]).default("completed"),
  displayOrder: z.number().int().min(0).default(0),
});

export const projectFormSchema = projectBaseSchema.extend({
  coverImage: mediaSchema.optional(),
  gallery: z.array(mediaSchema).optional(),
  video: mediaSchema.nullable().optional(),
});

export const projectPersistedSchema = projectBaseSchema.extend({
  coverImage: mediaSchema,
  gallery: z.array(mediaSchema).default([]),
  video: mediaSchema.nullable().optional(),
});

// Backward compatibility exports
export const projectValidationSchema = projectPersistedSchema;
export type ProjectValidationValues = z.infer<typeof projectPersistedSchema>;
