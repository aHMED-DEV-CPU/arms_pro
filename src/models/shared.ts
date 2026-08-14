import mongoose from "mongoose";

export const LocalizedStringSchema = new mongoose.Schema(
  {
    en: { type: String, required: true },
    ar: { type: String, required: false, default: "" },
  },
  { _id: false }
);

export const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);
