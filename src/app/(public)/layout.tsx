import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCompanySettings } from "@/lib/data/company";
import { getLanguage } from "@/lib/i18n-server";
import { getLocalizedValue } from "@/lib/i18n";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getCompanySettings();
  const lang = await getLanguage();
  
  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={lang === "ar" ? "font-arabic" : "font-sans"}
    >
      <Navbar
        logoUrl={settings?.logo?.url}
        companyName={companyName}
        lang={lang}
      />
      <main className="flex-1 min-h-screen flex flex-col">{children}</main>
      <Footer lang={lang} />
    </div>
  );
}
