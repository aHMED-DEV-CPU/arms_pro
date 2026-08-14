import { z } from "zod";
import { mediaSchema } from "./shared";

export const partnerValidationSchema = z.object({
  name: z.string().trim().min(1, "Partner name is required"),
  logo: mediaSchema,
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export type PartnerValidationValues = z.infer<typeof partnerValidationSchema>;
