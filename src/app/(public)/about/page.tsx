import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";
import { getCompanySettings } from "@/lib/data/company";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { getLanguage } from "@/lib/i18n-server";
import { t, getLocalizedValue } from "@/lib/i18n";

export default async function AboutPage() {
  const settings = await getCompanySettings();
  const lang = await getLanguage();

  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";
  const aboutParagraphs = settings?.aboutParagraphs || [];

  const values = [
    { title: t("about", "excellence", lang) },
    { title: t("about", "innovation", lang) },
    { title: t("about", "integrity", lang) },
    { title: t("about", "quality", lang) },
  ];

  const capabilities = [
    {
      title: t("about", "cap1Title", lang),
      body: t("about", "cap1Body", lang),
    },
    {
      title: t("about", "cap2Title", lang),
      body: t("about", "cap2Body", lang),
    },
    {
      title: t("about", "cap3Title", lang),
      body: t("about", "cap3Body", lang),
    },
    {
      title: t("about", "cap4Title", lang),
      body: t("about", "cap4Body", lang),
    },
  ];

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("about", "aboutEyebrow", lang)} {companyName}
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight text-dark sm:text-7xl">
                {t("about", "aboutTitle", lang)}
              </h1>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <div className="space-y-6 text-lg leading-8 text-muted">
              {aboutParagraphs.map((para, idx) => (
                <p key={idx}>{getLocalizedValue(para, lang)}</p>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
            {settings?.aboutImage?.url ? (
              <Image
                src={settings.aboutImage.url}
                alt={`${companyName}`}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                <span className="text-dark/40 text-xs">{t("about", "noAboutImage", lang)}</span>
              </div>
            )}
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("about", "capabilitiesTitle", lang)}
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-dark">
                {t("about", "capabilitiesHeading", lang)}
              </h2>
            </div>
            <div className="grid gap-8">
              {capabilities.map((section, index) => (
                <Reveal key={section.title} delay={index * 0.05}>
                  <article className="border-l-2 border-accent pl-5 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-5">
                    <p className="text-xs font-semibold tracking-[0.24em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-dark">
                      {section.title}
                    </h3>
                    <p className="mt-3 leading-7 text-muted">{section.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("about", "valuesEyebrow", lang)}
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-dark">
                {t("about", "valuesTitle", lang)}
              </h2>
            </div>
            <div className="grid border-y border-dark/12 sm:grid-cols-2">
              {values.map((value, index) => (
                <Reveal key={index}>
                  <div className="border-dark/12 py-6 sm:border-r sm:px-6 sm:even:border-r-0 border-dark/12 rtl:sm:border-r-0 rtl:sm:border-l rtl:sm:even:border-l-0">
                    <p className="text-xs font-semibold tracking-[0.26em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-dark">
                      {value.title}
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Social Links Block */}
          {settings?.socialLinks && (
            <div className="mt-20 border-t border-dark/12 pt-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold text-dark">{t("about", "connectTitle", lang)}</h3>
                <p className="text-sm text-muted mt-1">
                  {t("about", "connectDesc", lang)}
                </p>
              </div>
              <SocialLinks socialLinks={settings.socialLinks} variant="pill" />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
