import dbConnect from "@/lib/db/mongoose";
import Partner from "@/models/Partner";
import { IPartner } from "@/types";
import { serializeDoc } from "./serialize";

export async function getPartners(): Promise<IPartner[]> {
  await dbConnect();
  const partners = await Partner.find({ active: true }).lean();
  return serializeDoc<IPartner[]>(partners);
}
