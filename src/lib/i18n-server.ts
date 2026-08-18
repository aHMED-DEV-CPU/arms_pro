import "server-only";
import { cookies } from "next/headers";
import { TranslationLang } from "./i18n";

export async function getLanguage(): Promise<TranslationLang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  return lang === "ar" ? "ar" : "en";
}
