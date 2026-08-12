import { Reveal } from "@/components/animations/Reveal";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Container } from "@/components/ui/Container";
import { services } from "@/data/services";
import { getPublicImageFiles } from "@/lib/utils/media";

export default async function ServicesPage() {
  const serviceCards = await Promise.all(
    services.map(async (service) => ({
      service,
      image: (await getPublicImageFiles("images", "services", service.imageFolder))
        .at(0)?.src,
    })),
  );

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Services
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              Our Services
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              Integrated expertise across construction, design, finishing,
              structural systems and architectural solutions.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {serviceCards.map(({ service, image }, index) => (
              <Reveal key={service.slug} className="h-full" delay={(index % 2) * 0.08}>
                <ServiceCard service={service} image={image} index={index} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
