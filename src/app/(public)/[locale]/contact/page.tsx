import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";
import { getCompanySettings } from "@/lib/data/company";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { getLanguage } from "@/lib/i18n-server";
import type { Metadata } from "next";
import { defaultSeoMetadata, getLocalizedAlternates } from "@/lib/seo";
import { t, getLocalizedValue } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: defaultSeoMetadata.contact.title,
    description: defaultSeoMetadata.contact.description,
    alternates: getLocalizedAlternates(locale, "/contact"),
  };
}

function normalizeWhatsAppNumber(phone: string): string {
  let normalized = phone.trim();
  normalized = normalized
    .replace(/\+/g, "")
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

  if (normalized.startsWith("05")) {
    normalized = "966" + normalized.substring(1);
  }

  return normalized;
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (locale === "ar" ? "ar" : "en");
  const settings = await getCompanySettings();

  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";
  const phone = settings?.phone || "0551119136";
  const contactEmail = settings?.contactEmail || "INFO@SWAED.COM.SA";
  const address = getLocalizedValue(settings?.address, lang) || "Al Muzahimiyah - OMDB 4216 - Al Hada - 19651";

  const whatsappNumber = settings?.socialLinks?.whatsapp
    ? normalizeWhatsAppNumber(settings.socialLinks.whatsapp)
    : "";

  const mailtoSubject = lang === "ar" 
    ? `اتصال من موقع ${companyName} الإلكتروني`
    : `Contact from ${companyName} Website`;

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t("contact", "title", lang)}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {t("contact", "subtitle", lang)}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              {t("contact", "description", lang)}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* Left Column: Contact Information */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-semibold text-dark tracking-tight">
                  {t("contact", "infoTitle", lang)}
                </h2>
                <p className="mt-3 text-sm text-muted">
                  {t("contact", "infoDesc", lang)}
                </p>
              </div>

              <div className="grid gap-8">
                <Reveal delay={0.05}>
                  <div className="border-l-2 border-accent pl-5 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {t("contact", "phoneLabel", lang)}
                    </p>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="mt-2 block text-xl font-semibold text-dark hover:text-accent transition duration-200 focus:outline-none focus:text-accent"
                      dir="ltr"
                    >
                      {phone}
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="border-l-2 border-accent pl-5 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {t("contact", "emailLabel", lang)}
                    </p>
                    <a
                      href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                      className="mt-2 block text-xl font-semibold text-dark hover:text-accent transition duration-200 break-all focus:outline-none focus:text-accent"
                      dir="ltr"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="border-l-2 border-accent pl-5 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      {t("contact", "addressLabel", lang)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-dark leading-relaxed select-text">
                      {address}
                    </p>
                  </div>
                </Reveal>
              </div>

              {settings?.socialLinks && (
                <Reveal delay={0.2}>
                  <div className="pt-4 border-t border-dark/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted mb-4">
                      {t("contact", "socialLabel", lang)}
                    </p>
                    <SocialLinks socialLinks={settings.socialLinks} variant="pill" />
                  </div>
                </Reveal>
              )}
            </div>

            {/* Right Column: Contact Action Panel */}
            <Reveal delay={0.1}>
              <div className="bg-secondary p-8 sm:p-10 rounded-2xl border border-dark/5 shadow-sm space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-dark tracking-tight">
                    {t("contact", "startConversation", lang)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {t("contact", "conversationDesc", lang)}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href={`mailto:${contactEmail}?subject=${encodeURIComponent(mailtoSubject)}`}
                    className="flex items-center justify-center gap-3 h-12 w-full bg-dark text-white hover:bg-accent hover:text-dark font-semibold rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t("contact", "emailUsButton", lang)}
                  </a>

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 h-12 w-full border border-dark/18 hover:bg-emerald-50/50 hover:border-emerald-600 hover:text-emerald-800 text-dark font-semibold rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t("contact", "whatsappButton", lang)}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Additional / Secondary Contacts Section */}
          {(settings?.founderEmail || settings?.salesEmail) && (
            <div className="mt-20 border-t border-dark/12 pt-16">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {t("contact", "keyContacts", lang)}
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-dark tracking-tight">
                    {t("contact", "directConnections", lang)}
                  </h3>
                  <p className="mt-3 text-sm text-muted">
                    {t("contact", "departmentDesc", lang)}
                  </p>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {settings.founderEmail && (
                  <Reveal delay={0.05}>
                    <div className="bg-secondary/60 p-6 rounded-xl border border-dark/5 hover:border-accent/40 transition duration-300">
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">{t("contact", "founderLabel", lang)}</p>
                      <h4 className="mt-1 text-lg font-semibold text-dark">{t("contact", "founderOffice", lang)}</h4>
                      <a
                        href={`mailto:${settings.founderEmail}`}
                        className="mt-3 block text-sm text-muted hover:text-accent font-medium transition duration-200 focus:outline-none focus:text-accent"
                        dir="ltr"
                      >
                        {settings.founderEmail}
                      </a>
                    </div>
                  </Reveal>
                )}

                {settings.salesEmail && (
                  <Reveal delay={0.1}>
                    <div className="bg-secondary/60 p-6 rounded-xl border border-dark/5 hover:border-accent/40 transition duration-300">
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">{t("contact", "salesLabel", lang)}</p>
                      <h4 className="mt-1 text-lg font-semibold text-dark">{t("contact", "salesOffice", lang)}</h4>
                      <a
                        href={`mailto:${settings.salesEmail}`}
                        className="mt-3 block text-sm text-muted hover:text-accent font-medium transition duration-200 focus:outline-none focus:text-accent"
                        dir="ltr"
                      >
                        {settings.salesEmail}
                      </a>
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
