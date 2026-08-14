import mongoose, { Schema } from "mongoose";
import { IProject } from "@/types";
import { LocalizedStringSchema, MediaSchema } from "./shared";

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: LocalizedStringSchema, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: LocalizedStringSchema, required: true },
    shortDescription: { type: LocalizedStringSchema, required: true },
    fullDescription: { type: LocalizedStringSchema, required: true },
    coverImage: { type: MediaSchema, required: true },
    gallery: { type: [MediaSchema], default: [] },
    video: { type: MediaSchema },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["completed", "in-progress", "upcoming", "on-hold"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
