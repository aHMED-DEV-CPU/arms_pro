import { Reveal } from "@/components/animations/Reveal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container } from "@/components/ui/Container";
import { projects } from "@/data/projects";
import { getPublicImageFiles } from "@/lib/utils/media";

export default async function ProjectsPage() {
  const projectCards = await Promise.all(
    projects.map(async (project) => ({
      project,
      image: (await getPublicImageFiles("images", "projects", project.folder)).at(
        0,
      )?.src,
    })),
  );

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Projects
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              Our Projects
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              A selection of work across construction, interiors, steel systems,
              portable units and architectural solutions.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            {projectCards.map(({ project, image }, index) => (
              <Reveal key={project.slug} className="h-full">
                <ProjectCard
                  project={project}
                  image={image}
                  index={index}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
