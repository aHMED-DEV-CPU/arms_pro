import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { Container } from "@/components/ui/Container";
import { getProjectBySlug, getProjects } from "@/lib/data/projects";
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
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const lang = (locale === "ar" ? "ar" : "en") as TranslationLang;
  const siteUrl = getSiteUrl();
  const name = getLocalizedValue(project.title, lang);
  const shortDescription = getLocalizedValue(project.shortDescription, lang);

  const title = `${name} | ARMS PRO`;
  const description = shortDescription || "";
  const imageUrl = project.coverImage?.url;

  return {
    title,
    description,
    alternates: getLocalizedAlternates(locale, `/projects/${slug}`),
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/projects/${slug}`,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: locale === "ar" ? "ar_AR" : "en_US",
    },
  };
}

export async function generateStaticParams() {
  const dbProjects = await getProjects();
  return dbProjects.flatMap((project) => [
    { locale: "en", slug: project.slug },
    { locale: "ar", slug: project.slug },
  ]);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  const lang = (locale === "ar" ? "ar" : "en");

  if (!project) {
    notFound();
  }

  const galleryImages = (project.gallery || []).map((img) => ({
    name: img.publicId,
    src: img.url,
  }));

  const video = project.video;
  const coverImage = project.coverImage;

  const siteUrl = getSiteUrl();
  const title = getLocalizedValue(project.title, lang);

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
        "name": lang === "ar" ? "مشاريعنا" : "Projects",
        "item": `${siteUrl}/${locale}/projects`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `${siteUrl}/${locale}/projects/${slug}`,
      },
    ],
  };

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t("projects", "projectEyebrow", lang)}
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {title}
            </h1>
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
                  alt={`${title} cover`}
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

      <section className={video?.url || coverImage?.url ? "pb-14 md:pb-20" : "py-14 md:py-20"}>
        <Container>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t("projects", "galleryEyebrow", lang)}
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-dark">
              {t("projects", "galleryTitle", lang)}
            </h2>
          </div>
          <ImageGallery images={galleryImages} title={title} lang={lang} />
        </Container>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
