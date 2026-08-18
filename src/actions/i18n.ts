"use server";

import { cookies } from "next/headers";
import { TranslationLang } from "@/lib/i18n";

export async function setLanguageAction(lang: TranslationLang) {
  if (lang !== "en" && lang !== "ar") {
    throw new Error("Invalid language choice");
  }

  const cookieStore = await cookies();
  cookieStore.set("lang", lang, {
    path: "/",
    maxAge: 31536000, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return { success: true };
}
