import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

export const serviceValidationSchema = z.object({
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
  coverImage: mediaSchema,
  gallery: z.array(mediaSchema).default([]),
  video: mediaSchema.optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
});

export type ServiceValidationValues = z.infer<typeof serviceValidationSchema>;
