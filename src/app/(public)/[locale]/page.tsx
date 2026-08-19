import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/Reveal";
import { PartnersSlider } from "@/components/home/PartnersSlider";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Container } from "@/components/ui/Container";
import { getFeaturedServices } from "@/lib/data/services";
import { getFeaturedProjects } from "@/lib/data/projects";
import { getPartners } from "@/lib/data/partners";
import { getCompanySettings } from "@/lib/data/company";
import type { Metadata } from "next";
import { defaultSeoMetadata, safeJsonLd, getSiteUrl, getLocalizedAlternates } from "@/lib/seo";
import { t, getLocalizedValue, localizedPath } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: defaultSeoMetadata.home.title,
    description: defaultSeoMetadata.home.description,
    alternates: getLocalizedAlternates(locale, "/"),
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (locale === "ar" ? "ar" : "en");
  const dbServices = await getFeaturedServices();
  const dbProjects = await getFeaturedProjects();
  const dbPartners = await getPartners();
  const settings = await getCompanySettings();
  const siteUrl = getSiteUrl();

  const socialLinksObj = settings?.socialLinks || {};
  const sameAs: string[] = Object.values(socialLinksObj).filter(
    (val): val is string => typeof val === "string" && val.trim() !== ""
  );

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings?.companyName?.en || "ARMS PRO",
    "url": siteUrl,
    "logo": settings?.logo?.url || "",
    "telephone": settings?.phone || "",
    "email": settings?.contactEmail || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.address?.en || "",
    },
    "sameAs": sameAs,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": settings?.companyName?.en || "ARMS PRO",
    "url": siteUrl,
  };

  const companyName = getLocalizedValue(settings?.companyName, lang) || "ARMS PRO";
  const aboutParagraphs = settings?.aboutParagraphs || [];
  const homeParagraphs = aboutParagraphs.slice(0, 2);

  const heroUrl = settings?.heroImage?.url;
  const aboutImageUrl = settings?.aboutImage?.url;

  const partnerLogos = dbPartners.map((p) => ({
    name: p.name,
    src: p.logo.url,
    websiteUrl: p.websiteUrl,
  }));

  const values = [
    { label: t("about", "excellence", lang) },
    { label: t("about", "innovation", lang) },
    { label: t("about", "integrity", lang) },
    { label: t("about", "quality", lang) },
  ];

  return (
    <>
      <section className="relative min-h-[82vh] overflow-hidden bg-dark home">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={`${companyName}`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%] sm:object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-dark/95 flex items-center justify-center">
            <span className="text-white/60 text-sm">{t("home", "noHeroImage", lang)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,40,43,0.86)_0%,rgba(45,55,59,0.68)_42%,rgba(32,40,43,0.24)_78%,rgba(32,40,43,0.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-dark/55 to-transparent" />
        <Container className="relative flex min-h-[82vh] items-end pb-16 pt-24 sm:pb-24">
          <div className="max-w-4xl text-white">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-soft-accent">
                {companyName.toUpperCase()}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] text-[#f1eee7] sm:text-7xl lg:text-8xl">
                {t("home", "heroTitle", lang)}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8dcda] sm:text-xl">
                {t("home", "heroDesc", lang)}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={localizedPath(lang, "/projects")}
                  className="inline-flex justify-center rounded-xl border border-accent bg-accent px-6 py-3 text-sm font-semibold text-dark transition hover:bg-soft-accent"
                >
                  {t("home", "heroExplore", lang)}
                </Link>
                <Link
                  href={localizedPath(lang, "/services")}
                  className="inline-flex justify-center rounded-xl border border-white/55 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:!text-dark"
                >
                  {t("home", "heroServices", lang)}
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {t("home", "aboutEyebrow", lang)} {companyName}
                </p>
                <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
                  {t("home", "aboutTitle", lang)}
                </h2>
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.08}>
                <div className="space-y-6 text-lg leading-8 text-muted">
                  {homeParagraphs.map((para, idx) => (
                    <p key={idx}>{getLocalizedValue(para, lang)}</p>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-10 grid grid-cols-2 border-y border-dark/12 sm:grid-cols-4">
                  {values.map((value, index) => (
                    <div
                      key={index}
                      className="border-dark/12 py-5 ps-1.5 border-r border-b last:border-r-0 border-dark/12 sm:border-b-0"
                    >
                      <p className="text-xs font-semibold tracking-[0.22em] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 font-semibold text-dark">{value.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.12}>
            <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
                {aboutImageUrl ? (
                  <Image
                    src={aboutImageUrl}
                    alt={`${companyName}`}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                    <span className="text-dark/40 text-xs">{t("home", "noAboutImage", lang)}</span>
                  </div>
                )}
              </div>
              <div className="border-l-2 border-accent pl-6 text-sm uppercase tracking-[0.18em] text-muted rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-6">
                <p>
                  {t("home", "aboutBadge", lang)}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("home", "servicesEyebrow", lang)}
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                {t("home", "servicesTitle", lang)}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                {t("home", "servicesDesc", lang)}
              </p>
            </div>
            <Link
              href={localizedPath(lang, "/services")}
              className="text-sm font-semibold text-accent transition hover:text-dark shrink-0"
            >
              {t("home", "viewAllServices", lang)}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {dbServices.map((service, index) => (
              <Reveal key={service.slug} className="h-full" delay={index * 0.06}>
                <ServiceCard
                  service={service}
                  image={service.coverImage?.url}
                  index={index}
                  lang={lang}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("home", "projectsEyebrow", lang)}
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                {t("home", "projectsTitle", lang)}
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                {t("home", "projectsDesc", lang)}
              </p>
            </div>
            <Link
              href={localizedPath(lang, "/projects")}
              className="text-sm font-semibold text-accent transition hover:text-dark shrink-0"
            >
              {t("home", "viewAllProjects", lang)}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {dbProjects.map((project, index) => (
              <Reveal key={project.slug} className="h-full" delay={index * 0.06}>
                <ProjectCard
                  project={project}
                  image={project.coverImage?.url}
                  index={index}
                  lang={lang}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-secondary py-16 sm:py-20">
        <Container>
          <div className="mb-10 grid gap-4 md:grid-cols-[0.7fr_1fr] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                {t("home", "partnersEyebrow", lang)}
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                {t("home", "partnersTitle", lang)}
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-muted md:justify-self-end">
              {t("home", "partnersDesc", lang)}
            </p>
          </div>
        </Container>
        <PartnersSlider logos={partnerLogos} lang={lang} />
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
    </>
  );
}
