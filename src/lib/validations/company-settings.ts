import { z } from "zod";
import { localizedStringSchema, mediaSchema } from "./shared";

const socialUrlSchema = (message: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().url(message).optional().or(z.literal(""))
  );

const optionalEmailSchema = (message: string) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z
      .string()
      .email(message)
      .transform((val) => val.toLowerCase())
      .optional()
      .or(z.literal(""))
  );

export const companySettingsValidationSchema = z.object({
  companyName: localizedStringSchema,
  about: localizedStringSchema.optional(),
  aboutParagraphs: z
    .array(localizedStringSchema)
    .min(1, "At least one About paragraph is required"),
  phone: z.string().trim().min(1, "Phone number is required"),
  email: optionalEmailSchema("Invalid email address"),
  founderEmail: optionalEmailSchema("Invalid founder email address"),
  salesEmail: optionalEmailSchema("Invalid sales email address"),
  contactEmail: optionalEmailSchema("Invalid contact email address"),
  address: localizedStringSchema,
  commercialRegistration: z
    .string()
    .trim()
    .min(1, "Commercial registration is required"),
  unifiedEstablishmentNumber: z
    .string()
    .trim()
    .min(1, "Unified establishment number is required"),
  vatNumber: z.string().trim().min(1, "VAT number is required"),
  socialLinks: z
    .object({
      instagram: socialUrlSchema("Invalid Instagram URL"),
      linkedin: socialUrlSchema("Invalid LinkedIn URL"),
      x: socialUrlSchema("Invalid X/Twitter URL"),
      facebook: socialUrlSchema("Invalid Facebook URL"),
      youtube: socialUrlSchema("Invalid YouTube URL"),
      whatsapp: z.preprocess(
        (val) => (typeof val === "string" ? val.trim() : val),
        z.string()
          .optional()
          .refine((val) => !val || /^[+\d\s()\-]+$/.test(val), {
            message: "Invalid WhatsApp phone number",
          })
      ),
      tiktok: socialUrlSchema("Invalid TikTok URL"),
    })
    .optional(),
  logo: mediaSchema.optional(),
  heroImage: mediaSchema.optional(),
  aboutImage: mediaSchema.optional(),
});

export type CompanySettingsValidationValues = z.infer<
  typeof companySettingsValidationSchema
>;
