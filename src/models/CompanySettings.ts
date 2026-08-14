import mongoose, { Schema } from "mongoose";
import { ICompanySettings } from "@/types";
import { LocalizedStringSchema, MediaSchema } from "./shared";

const SocialLinksSchema = new Schema(
  {
    instagram: { type: String },
    linkedin: { type: String },
    x: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    whatsapp: { type: String },
  },
  { _id: false }
);

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    companyName: { type: LocalizedStringSchema, required: true },
    about: { type: LocalizedStringSchema, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: LocalizedStringSchema, required: true },
    commercialRegistration: { type: String, required: true },
    unifiedEstablishmentNumber: { type: String, required: true },
    vatNumber: { type: String, required: true },
    socialLinks: { type: SocialLinksSchema },
    logo: { type: MediaSchema },
    heroImage: { type: MediaSchema },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CompanySettings ||
  mongoose.model<ICompanySettings>("CompanySettings", CompanySettingsSchema);
