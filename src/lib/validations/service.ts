import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

export const serviceBaseSchema = z.object({
  name: localizedStringSchema,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  shortDescription: localizedStringSchema,
  overview: localizedStringSchema,
  details: z.array(localizedStringSchema).min(1, "At least one detail item is required"),
  capabilitiesTitle: localizedStringSchema.optional(),
  capabilities: z.array(localizedStringSchema).optional(),
  benefitsTitle: localizedStringSchema.optional(),
  benefits: z
    .array(
      z.object({
        title: localizedStringSchema,
        text: localizedStringSchema,
      })
    )
    .optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
  displayOrder: z.number().int().min(0).default(0),
});

export const serviceFormSchema = serviceBaseSchema.extend({
  coverImage: mediaSchema.optional(),
  gallery: z.array(mediaSchema).optional(),
  video: mediaSchema.nullable().optional(),
});

export const servicePersistedSchema = serviceBaseSchema.extend({
  coverImage: mediaSchema,
  gallery: z.array(mediaSchema).default([]),
  video: mediaSchema.nullable().optional(),
});

// Backward compatibility exports
export const serviceValidationSchema = servicePersistedSchema;
export type ServiceValidationValues = z.infer<typeof servicePersistedSchema>;
