import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCompanySettings } from "@/lib/data/company";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getCompanySettings();

  return (
    <>
      <Navbar logoUrl={settings?.logo?.url} companyName={settings?.companyName?.en || "ARMS PRO"} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
