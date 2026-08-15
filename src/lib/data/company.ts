import dbConnect from "@/lib/db/mongoose";
import CompanySettings from "@/models/CompanySettings";
import { ICompanySettings } from "@/types";
import { serializeDoc } from "./serialize";

export async function getCompanySettings(): Promise<ICompanySettings | null> {
  await dbConnect();
  const settings = await CompanySettings.findOne().lean();
  return serializeDoc<ICompanySettings | null>(settings);
}
