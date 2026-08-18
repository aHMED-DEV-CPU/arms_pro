import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getCompanySettings } from "@/lib/data/company";
import { SocialLinks } from "./SocialLinks";
import { t, getLocalizedValue, TranslationLang } from "@/lib/i18n";

const quickLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/services", labelKey: "services" as const },
  { href: "/projects", labelKey: "projects" as const },
  { href: "/contact", labelKey: "getInTouch" as const },
];

interface FooterProps {
  lang?: TranslationLang;
}

export async function Footer({ lang = "en" }: FooterProps) {
  const settings = await getCompanySettings();

  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";
  const phone = settings?.phone || "0551119136";
  const cr = settings?.commercialRegistration || "1111103343";
  const uen = settings?.unifiedEstablishmentNumber || "7039472662";
  const vat = settings?.vatNumber || "312627669500003";
  const address = getLocalizedValue(settings?.address, lang) || "Al Muzahimiyah – OMDB 4216 – Al Hada – 19651";

  return (
    <footer className="bg-dark py-12 text-sm text-white/60 sm:py-14">
      <Container>
        {/* TOP AREA: Brand/company identity */}
        <div className="border-b border-white/12 pb-8">
          <p className="text-3xl font-semibold tracking-wider text-white sm:text-4xl">
            {companyName}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
            {lang === "ar"
              ? "مجموعة سعودية للمقاولات، العمارة، التصميم الداخلي، والحلول الإنشائية المتخصصة."
              : "A Saudi group for contracting, architecture, interiors and specialized construction solutions."}
          </p>
          <div className="mt-6">
            <SocialLinks socialLinks={settings?.socialLinks} />
          </div>
        </div>

        {/* MIDDLE AREA: 3 main columns */}
        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-3 border-b border-white/12">
          {/* Column 1: Quick Links */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {t("footer", "quickLinks", lang)}
            </h2>
            <nav className="flex flex-col gap-2.5 text-xs text-white/55">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-white focus:outline-none focus:text-white w-max"
                >
                  {t("nav", link.labelKey, lang)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 2: Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {t("footer", "contact", lang)}
            </h2>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  {t("footer", "phone", lang)}
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="transition hover:text-white block mt-1 text-sm font-semibold text-white/70 focus:outline-none focus:text-white text-left rtl:text-right"
                  dir="ltr"
                >
                  {phone}
                </a>
              </div>

              {settings?.founderEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                    {t("footer", "founder", lang)}
                  </p>
                  <a
                    href={`mailto:${settings.founderEmail}`}
                    className="transition hover:text-white block mt-1 text-sm font-semibold text-white/70 focus:outline-none focus:text-white text-left rtl:text-right"
                    dir="ltr"
                  >
                    {settings.founderEmail}
                  </a>
                </div>
              )}

              {settings?.salesEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                    {t("footer", "salesAndBiz", lang)}
                  </p>
                  <a
                    href={`mailto:${settings.salesEmail}`}
                    className="transition hover:text-white block mt-1 text-sm font-semibold text-white/70 focus:outline-none focus:text-white text-left rtl:text-right"
                    dir="ltr"
                  >
                    {settings.salesEmail}
                  </a>
                </div>
              )}

              {settings?.contactEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                    {t("footer", "contactUs", lang)}
                  </p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="transition hover:text-white block mt-1 text-sm font-semibold text-white/70 focus:outline-none focus:text-white text-left rtl:text-right"
                    dir="ltr"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Company / Legal Info */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              {t("footer", "companyInfo", lang)}
            </h2>
            <div className="space-y-4 text-xs text-white/55">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  {t("footer", "cr", lang)}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/70 text-left rtl:text-right" dir="ltr">
                  {cr}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  {t("footer", "uen", lang)}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/70 text-left rtl:text-right" dir="ltr">
                  {uen}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  {t("footer", "vat", lang)}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/70 text-left rtl:text-right" dir="ltr">
                  {vat}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  {t("footer", "address", lang)}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/70 leading-relaxed break-words">
                  {address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM AREA: Copyright / legal footer line */}
        <div className="pt-6 text-xs uppercase tracking-[0.16em] text-white/40 flex flex-row justify-between flex-wrap gap-2">
          <p>
            &copy; {new Date().getFullYear()} {companyName} - {t("footer", "copyright", lang)}
          </p>
        </div>
      </Container>
    </footer>
  );
}
