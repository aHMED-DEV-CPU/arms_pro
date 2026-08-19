import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { ServiceOverview } from "@/components/services/ServiceOverview";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug, getServices } from "@/lib/data/services";
import { getLanguage } from "@/lib/i18n-server";
import { t, getLocalizedValue } from "@/lib/i18n";
import type { Metadata } from "next";
import { getSiteUrl, safeJsonLd, getLocalizedAlternates } from "@/lib/seo";
import { TranslationLang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service || service.status === "draft") {
    return {};
  }

  const lang = (locale === "ar" ? "ar" : "en") as TranslationLang;
  const siteUrl = getSiteUrl();
  const name = getLocalizedValue(service.name, lang);
  const shortDescription = getLocalizedValue(service.shortDescription, lang);
  
  const title = `${name} | ARMS PRO`;
  const description = shortDescription || "";
  const imageUrl = service.coverImage?.url;

  return {
    title,
    description,
    alternates: getLocalizedAlternates(locale, `/services/${slug}`),
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/services/${slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: locale === "ar" ? "ar_AR" : "en_US",
    },
  };
}

export async function generateStaticParams() {
  const dbServices = await getServices();
  return dbServices.flatMap((service) => [
    { locale: "en", slug: service.slug },
    { locale: "ar", slug: service.slug },
  ]);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);
  const lang = (locale === "ar" ? "ar" : "en");

  if (!service || service.status === "draft") {
    notFound();
  }

  const galleryImages = (service.gallery || []).map((img) => ({
    name: img.publicId,
    src: img.url,
  }));

  const video = service.video;
  const coverImage = service.coverImage;

  const siteUrl = getSiteUrl();
  const name = getLocalizedValue(service.name, lang);
  const shortDescription = getLocalizedValue(service.shortDescription, lang);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name.en,
    "description": service.shortDescription.en || "",
    "image": service.coverImage?.url || "",
    "provider": {
      "@type": "Organization",
      "name": "ARMS PRO",
      "url": siteUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": lang === "ar" ? "الرئيسية" : "Home",
        "item": `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": lang === "ar" ? "خدماتنا" : "Services",
        "item": `${siteUrl}/${locale}/services`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `${siteUrl}/${locale}/services/${slug}`,
      },
    ],
  };

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t("services", "serviceEyebrow", lang)}
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {name}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              {shortDescription}
            </p>
          </Reveal>
        </Container>
      </section>

      {video?.url || coverImage?.url ? (
        <section className="py-14 sm:py-20">
          <Container>
            {video?.url ? (
              <video
                src={video.url}
                controls
                className="aspect-video w-full rounded-2xl bg-dark object-cover"
              >
                {t("services", "noVideoSupport", lang)}
              </video>
            ) : coverImage?.url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={coverImage.url}
                  alt={`${name} cover`}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      <section className={video?.url || coverImage?.url ? "pb-16 sm:pb-20" : "py-16 sm:py-20"}>
        <Container>
          <ServiceOverview service={service} lang={lang} />
        </Container>
      </section>

      {galleryImages.length > 0 ? (
        <section className="bg-secondary py-14 md:py-20">
          <Container>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {t("services", "galleryEyebrow", lang)}
                </p>
                <h2 className="mt-4 text-4xl font-semibold text-dark">
                  {t("services", "galleryTitle", lang)}
                </h2>
              </div>
            </div>
            <ImageGallery images={galleryImages} title={name} lang={lang} />
          </Container>
        </section>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
