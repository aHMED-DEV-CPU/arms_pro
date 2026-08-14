import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

export const companySettingsValidationSchema = z.object({
  companyName: localizedStringSchema,
  about: localizedStringSchema,
  phone: z.string().trim().min(1, "Phone number is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
  address: localizedStringSchema,
  commercialRegistration: z.string().trim().min(1, "Commercial registration is required"),
  unifiedEstablishmentNumber: z.string().trim().min(1, "Unified establishment number is required"),
  vatNumber: z.string().trim().min(1, "VAT number is required"),
  socialLinks: z
    .object({
      instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal("")),
      linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
      x: z.string().url("Invalid X/Twitter URL").optional().or(z.literal("")),
      facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
      youtube: z.string().url("Invalid YouTube URL").optional().or(z.literal("")),
      whatsapp: z.string().optional().or(z.literal("")),
    })
    .optional(),
  logo: mediaSchema.optional(),
  heroImage: mediaSchema.optional(),
});

export type CompanySettingsValidationValues = z.infer<typeof companySettingsValidationSchema>;
