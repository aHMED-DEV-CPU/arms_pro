import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { ServiceOverview } from "@/components/services/ServiceOverview";
import { Container } from "@/components/ui/Container";
import { getServiceBySlug, getServices } from "@/lib/data/services";

export async function generateStaticParams() {
  const dbServices = await getServices();
  return dbServices.map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service || service.status === "draft") {
    notFound();
  }

  const galleryImages = (service.gallery || []).map((img) => ({
    name: img.publicId,
    src: img.url,
  }));

  const video = service.video;
  const coverImage = service.coverImage;

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Service
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {service.name.en}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              {service.shortDescription.en}
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
                Your browser does not support the video tag.
              </video>
            ) : coverImage?.url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={coverImage.url}
                  alt={`${service.name.en} cover`}
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
          <ServiceOverview service={service} />
        </Container>
      </section>

      {galleryImages.length > 0 ? (
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
            <ImageGallery images={galleryImages} title={service.name.en} />
          </Container>
        </section>
      ) : null}
    </>
  );
}
