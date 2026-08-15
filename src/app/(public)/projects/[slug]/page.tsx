import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { Container } from "@/components/ui/Container";
import { getProjectBySlug, getProjects } from "@/lib/data/projects";

export async function generateStaticParams() {
  const dbProjects = await getProjects();
  return dbProjects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const galleryImages = (project.gallery || []).map((img) => ({
    name: img.publicId,
    src: img.url,
  }));

  const video = project.video;
  const coverImage = project.coverImage;

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Project
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {project.title.en}
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
                Your browser does not support the video tag.
              </video>
            ) : coverImage?.url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
                <Image
                  src={coverImage.url}
                  alt={`${project.title.en} cover`}
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
              Gallery
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-dark">
              Project Gallery
            </h2>
          </div>
          <ImageGallery images={galleryImages} title={project.title.en} />
        </Container>
      </section>
    </>
  );
}
