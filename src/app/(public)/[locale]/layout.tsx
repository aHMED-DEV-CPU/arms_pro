import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCompanySettings } from "@/lib/data/company";
import { getLocalizedValue, TranslationLang } from "@/lib/i18n";
import { IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/seo";
import "../../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      template: "%s | ARMS PRO",
      default: "ARMS PRO | Contracting, Design & Construction",
    },
    description: "Saudi construction, architecture, interior finishing, and contracting company delivering premium structural and architectural solutions.",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "ARMS PRO",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

interface PublicLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "ar") {
    notFound();
  }
  const lang = (locale === "ar" ? "ar" : "en") as TranslationLang;
  
  const settings = await getCompanySettings();
  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${manrope.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
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
      </body>
    </html>
  );
}
