import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";

const values = ["Excellence", "Innovation", "Integrity", "Quality"];

export default function AboutPage() {
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
                ARMS PRO is a Saudi group providing integrated construction,
                engineering, interior design, finishing, structural, and
                architectural solutions for commercial, residential,
                hospitality, and specialized projects.
              </p>
              <p>
                Our capabilities span general contracting, steel structures,
                Light Gauge Steel systems, interior and exterior design,
                high-end fit-outs, custom furniture, kitchens and wardrobes,
                portable units, and architectural facade solutions.
              </p>
              <p>
                By bringing these disciplines together, we are able to support
                projects from early concept and planning through construction,
                finishing, and final execution, while maintaining a consistent
                focus on quality, practical solutions, and attention to detail.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/images/home/hero/hero.webp"
              alt="ARMS PRO interior and construction craftsmanship"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
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
