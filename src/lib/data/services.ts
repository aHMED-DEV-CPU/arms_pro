import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";
import { IService } from "@/types";
import { serializeDoc } from "./serialize";

export async function getServices(): Promise<IService[]> {
  await dbConnect();
  const services = await Service.find({ status: "published" })
    .sort({ displayOrder: 1 })
    .lean();
  return serializeDoc<IService[]>(services);
}

export async function getFeaturedServices(): Promise<IService[]> {
  await dbConnect();
  const services = await Service.find({ status: "published", featured: true })
    .sort({ displayOrder: 1 })
    .lean();
  return serializeDoc<IService[]>(services);
}

export async function getServiceBySlug(slug: string): Promise<IService | null> {
  await dbConnect();
  const service = await Service.findOne({ slug, status: "published" })
    .lean();
  return serializeDoc<IService | null>(service);
}
