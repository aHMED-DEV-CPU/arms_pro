import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { ServiceOverview } from "@/components/services/ServiceOverview";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug, services } from "@/data/services";
import { getPublicImageFiles, getPublicVideoFiles } from "@/lib/utils/media";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const images = await getPublicImageFiles(
    "images",
    "services",
    service.imageFolder,
  );
  const videos = await getPublicVideoFiles(
    "videos",
    "services",
    service.imageFolder,
  );
  const coverImage = images.at(0);
  const video = videos.at(0);

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Service
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {service.title}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              {service.shortDescription}
            </p>
          </Reveal>
        </Container>
      </section>

      {video || coverImage ? (
        <section className="py-14 sm:py-20">
          <Container>
            {video ? (
              <video
                src={video.src}
                controls
                className="aspect-video w-full rounded-2xl bg-dark object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : coverImage ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={coverImage.src}
                  alt={`${service.title} cover`}
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

      <section className={video || coverImage ? "pb-16 sm:pb-20" : "py-16 sm:py-20"}>
        <Container>
          <ServiceOverview service={service} />
        </Container>
      </section>

      {images.length > 0 ? (
        <section className="bg-secondary py-14 md:py-20">
          <Container>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Gallery
                </p>
                <h2 className="mt-4 text-4xl font-semibold text-dark">
                  Service Gallery
                </h2>
              </div>
            </div>
            <ImageGallery images={images} title={service.title} />
          </Container>
        </section>
      ) : null}
    </>
  );
}
