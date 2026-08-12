import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";

const contactItems = [
  { label: "Phone", value: "0551119136" },
  { label: "Email", value: "INFO@SWAED.COM.SA" },
  {
    label: "National Address",
    value: "Al Muzahimiyah - OMDB 4216 - Al Hada - 19651",
  },
];

const fields = ["Name", "Email", "Phone", "Subject"];

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

          <form className="rounded-xl border border-dark/12 bg-white/45 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field} className="grid gap-2 text-sm font-semibold text-dark">
                  {field}
                  <input
                    type={field === "Email" ? "email" : "text"}
                    className="h-12 border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent"
                    placeholder={field}
                  />
                </label>
              ))}
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-dark">
              Message
              <textarea
                rows={6}
                className="resize-none border-0 border-b border-dark/18 bg-transparent px-0 py-3 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent"
                placeholder="Message"
              />
            </label>
            <button
              type="button"
              className="mt-6 inline-flex rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark"
            >
              Submit
            </button>
          </form>
        </Container>
      </section>
    </>
  );
}
