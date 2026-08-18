import { Reveal } from "@/components/animations/Reveal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Container } from "@/components/ui/Container";
import { getProjects } from "@/lib/data/projects";
import { getLanguage } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function ProjectsPage() {
  const dbProjects = await getProjects();
  const lang = await getLanguage();

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {t("projects", "projectEyebrow", lang)}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              {t("projects", "projectsTitle", lang)}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              {t("projects", "projectsDesc", lang)}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {dbProjects.map((project, index) => (
              <Reveal key={project.slug} className="h-full" delay={(index % 3) * 0.08}>
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
    </>
  );
}
