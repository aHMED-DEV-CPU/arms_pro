import dbConnect from "@/lib/db/mongoose";
import CompanySettings from "@/models/CompanySettings";
import { ICompanySettings } from "@/types";
import { serializeDoc } from "./serialize";

export async function getCompanySettings(): Promise<ICompanySettings | null> {
  await dbConnect();
  const settings = await CompanySettings.findOne().lean();
  const serialized = serializeDoc<ICompanySettings | null>(settings);
  if (serialized) {
    if (serialized.email && !serialized.contactEmail) {
      serialized.contactEmail = serialized.email;
    }
    if ((!serialized.aboutParagraphs || serialized.aboutParagraphs.length === 0) && serialized.about && serialized.about.en) {
      serialized.aboutParagraphs = [serialized.about];
    } else if (!serialized.aboutParagraphs) {
      serialized.aboutParagraphs = [];
    }
  }
  return serialized;
}
