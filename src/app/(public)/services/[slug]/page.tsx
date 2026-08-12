import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug, services } from "@/data/services";
import { getPublicImageFiles, getPublicVideoFiles } from "@/lib/utils/media";

const foamStoneFeatures = [
  "Lightweight",
  "Thermal Insulation",
  "Sound Insulation",
  "Water & Moisture Resistance",
  "Design Flexibility",
  "Fast Execution",
];

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
        <Container className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Overview
            </p>
          </div>
          <div>
            <p className="max-w-3xl text-2xl leading-10 text-dark">
              {service.fullDescription}
            </p>
            {service.slug === "foam-stone" ? (
              <div className="mt-10 grid border-y border-dark/12 sm:grid-cols-2">
                {foamStoneFeatures.map((feature, index) => (
                  <div
                    key={feature}
                    className="border-dark/12 py-5 sm:border-r sm:px-5 sm:even:border-r-0"
                  >
                    <p className="text-xs font-semibold tracking-[0.22em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 font-semibold text-dark">{feature}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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
