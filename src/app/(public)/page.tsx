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
import { getPublicImageFiles } from "@/lib/utils/media";

const values = ["Excellence", "Innovation", "Integrity", "Quality"];

export default async function Home() {
  const dbServices = await getFeaturedServices();
  const dbProjects = await getFeaturedProjects();
  const dbPartners = await getPartners();
  const settings = await getCompanySettings();
  const companyName = settings?.companyName?.en || "ARMS PRO";
  const aboutParagraphs = settings?.aboutParagraphs || [];
  const homeParagraphs = aboutParagraphs.slice(0, 2);

  const heroUrl = settings?.heroImage?.url;
  const aboutImageUrl = settings?.aboutImage?.url;
  const partnerLogos = dbPartners.map((p) => ({
    name: p.name,
    src: p.logo.url,
    websiteUrl: p.websiteUrl,
  }));

  return (
    <>
      <section className="relative min-h-[82vh] overflow-hidden bg-dark home">
        {heroUrl ? (
          <Image
            src={heroUrl}
            alt={`${companyName} Light Gauge Steel construction site`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_42%] sm:object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-dark/95 flex items-center justify-center">
            <span className="text-white/60 text-sm">No Hero Cover Image Available</span>
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
                We Build Ideas Into Reality.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8dcda] sm:text-xl">
                Integrated construction, design, finishing, structural and
                architectural solutions delivered with quality, creativity and
                precision.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/projects"
                  className="inline-flex justify-center rounded-xl border border-accent bg-accent px-6 py-3 text-sm font-semibold text-dark transition hover:bg-soft-accent"
                >
                  Explore Our Projects
                </Link>
                <Link
                  href="/services"
                  className="inline-flex justify-center rounded-xl border border-white/55 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:!text-dark"
                >
                  Our Services
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
                  About {companyName}
                </p>
                <h2 className="mt-5 max-w-xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
                  Building More Than Structures
                </h2>
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.08}>
                <div className="space-y-6 text-lg leading-8 text-muted">
                  {homeParagraphs.map((para, idx) => (
                    <p key={idx}>{para.en}</p>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.16}>
                <div className="mt-10 grid grid-cols-2 border-y border-dark/12 sm:grid-cols-4">
                  {values.map((value, index) => (
                    <div
                      key={value}
                      className="border-dark/12 py-5 ps-1.5 sm:border-r sm:last:border-r-0"
                    >
                      <p className="text-xs font-semibold tracking-[0.22em] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 font-semibold text-dark">{value}</p>
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
                    alt={`${companyName} Light Gauge Steel construction work`}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary flex items-center justify-center">
                    <span className="text-dark/40 text-xs">No About Section Image Available</span>
                  </div>
                )}
              </div>
              <div className="border-l border-accent pl-6 text-sm uppercase tracking-[0.18em] text-muted">
                <p>
                  Integrated construction, interiors, steel systems and
                  architectural facade solutions.
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
                Services
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                From Our Services
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Integrated expertise across construction, structural systems,
                interiors and architectural solutions.
              </p>
            </div>
            <Link
              href="/services"
              className="text-sm font-semibold text-accent transition hover:text-dark"
            >
              View All Services
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {dbServices.map((service, index) => (
              <Reveal key={service.slug} className="h-full" delay={index * 0.06}>
                <ServiceCard service={service} image={service.coverImage?.url} index={index} />
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
                Projects
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                From Our Projects
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted">
                Selected work reflecting our experience across construction,
                interiors, structural systems and specialized architectural
                solutions.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-accent transition hover:text-dark"
            >
              View All Projects
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {dbProjects.map((project, index) => (
              <Reveal key={project.slug} className="h-full" delay={index * 0.06}>
                <ProjectCard
                  project={project}
                  image={project.coverImage?.url}
                  index={index}
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
                Partners
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-dark">
                Our Partners
              </h2>
            </div>
            <p className="max-w-xl leading-7 text-muted md:justify-self-end">
              Building strong relationships across our industries.
            </p>
          </div>
        </Container>
        <PartnersSlider logos={partnerLogos} />
      </section>
    </>
  );
}
