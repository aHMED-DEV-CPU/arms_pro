import mongoose, { Schema } from "mongoose";
import { IPartner } from "@/types";
import { MediaSchema } from "./shared";

const PartnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true },
    logo: { type: MediaSchema, required: true },
    websiteUrl: { type: String },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Partner ||
  mongoose.model<IPartner>("Partner", PartnerSchema);
