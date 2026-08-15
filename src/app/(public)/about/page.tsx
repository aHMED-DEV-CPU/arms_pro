import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";

import { getCompanySettings } from "@/lib/data/company";

const values = ["Excellence", "Innovation", "Integrity", "Quality"];

export default async function AboutPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                About ARMS PRO
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-tight text-dark sm:text-7xl">
                Building More Than Structures
              </h1>
            </Reveal>
          </div>
          <Reveal delay={0.08}>
            <div className="space-y-6 text-lg leading-8 text-muted">
              <p>
                {settings?.about?.en ||
                  `ARMS PRO brings together structural engineering, architectural
                  design, construction, finishing, and specialized facade
                  solutions to deliver projects through a coordinated and
                  practical approach.`}
              </p>
              <p>
                Our work is especially focused on steel and Light Gauge Steel
                systems, Foam Stone architectural facades, and architectural
                design for interior and exterior spaces.
              </p>
              <p>
                This integrated model allows the group to support projects from
                early concept development through execution, finishing, and final
                detailing.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/images/home/hero/hero.jpeg"
              alt="ARMS PRO Light Gauge Steel construction site"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Capabilities
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-dark">
                Structural, Facade and Design Strength
              </h2>
            </div>
            <div className="grid gap-8">
              {[
                {
                  title: "Steel & Light Gauge Steel Systems",
                  body: "A key part of our capabilities is the design and execution of steel and Light Gauge Steel systems for modern residential, commercial, and specialized structures. These systems support efficient construction, structural flexibility, precise execution, and adaptable architectural solutions.",
                },
                {
                  title: "Foam Stone & Architectural Facades",
                  body: "Our facade capabilities include lightweight Foam Stone architectural systems designed to provide refined exterior detailing with reduced structural weight and practical installation. These solutions support a wide range of architectural styles while contributing to insulation performance and design flexibility.",
                },
                {
                  title: "Architectural & Interior Design",
                  body: "Our design work connects architecture with functionality. From exterior concepts and modern villa architecture to interior planning and detailed finishing, our objective is to create spaces that reflect the project identity while remaining practical to execute.",
                },
                {
                  title: "Integrated Project Delivery",
                  body: "By combining structural systems, architectural design, construction, finishing, and facade solutions within one group, ARMS PRO can support projects from concept development through execution and final detailing.",
                },
              ].map((section, index) => (
                <Reveal key={section.title} delay={index * 0.05}>
                  <article className="border-l-2 border-accent pl-5">
                    <p className="text-xs font-semibold tracking-[0.24em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-dark">
                      {section.title}
                    </h3>
                    <p className="mt-3 leading-7 text-muted">{section.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                Values
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-dark">
                Principles That Guide the Work
              </h2>
            </div>
            <div className="grid border-y border-dark/12 sm:grid-cols-2">
              {values.map((value, index) => (
                <Reveal key={value}>
                  <div className="border-dark/12 py-6 sm:border-r sm:px-6 sm:even:border-r-0">
                    <p className="text-xs font-semibold tracking-[0.26em] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-dark">
                      {value}
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
