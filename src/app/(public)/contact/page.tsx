import { Reveal } from "@/components/animations/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";

const contactItems = [
  { label: "Phone", value: "0551119136" },
  { label: "Email", value: "INFO@SWAED.COM.SA" },
  {
    label: "National Address",
    value: "Al Muzahimiyah - OMDB 4216 - Al Hada - 19651",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              Contact ARMS PRO
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-muted">
              Share your project needs and our team will be ready to support the
              next step.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold text-dark">
              Contact Information
            </h2>
            <div className="mt-8 grid gap-6">
              {contactItems.map((item) => (
                <div key={item.label} className="border-l-2 border-accent pl-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-dark">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </Container>
      </section>
    </>
  );
}
