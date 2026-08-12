import Image from "next/image";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animations/Reveal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import { Container } from "@/components/ui/Container";
import { getProjectBySlug, projects } from "@/data/projects";
import { getPublicImageFiles, getPublicVideoFiles } from "@/lib/utils/media";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const images = await getPublicImageFiles("images", "projects", project.folder);
  const videos = await getPublicVideoFiles("videos", "projects", project.folder);
  const coverImage = images.at(0);
  const video = videos.at(0);

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Project
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {project.title}
            </h1>
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
                  alt={`${project.title} cover`}
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

      <section className={video || coverImage ? "pb-14 md:pb-20" : "py-14 md:py-20"}>
        <Container>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Gallery
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-dark">
              Project Gallery
            </h2>
          </div>
          <ImageGallery images={images} title={project.title} />
        </Container>
      </section>
    </>
  );
}
