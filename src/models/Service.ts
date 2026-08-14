import mongoose, { Schema } from "mongoose";
import { IService } from "@/types";
import { LocalizedStringSchema, MediaSchema } from "./shared";

const BenefitItemSchema = new Schema(
  {
    title: { type: LocalizedStringSchema, required: true },
    text: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: LocalizedStringSchema, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: LocalizedStringSchema, required: true },
    overview: { type: LocalizedStringSchema, required: true },
    details: { type: [LocalizedStringSchema], required: true },
    capabilitiesTitle: { type: LocalizedStringSchema },
    capabilities: { type: [LocalizedStringSchema] },
    benefitsTitle: { type: LocalizedStringSchema },
    benefits: { type: [BenefitItemSchema] },
    coverImage: { type: MediaSchema, required: true },
    gallery: { type: [MediaSchema], default: [] },
    video: { type: MediaSchema },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);
