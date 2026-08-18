import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";
import { getCompanySettings } from "@/lib/data/company";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function normalizeWhatsAppNumber(phone: string): string {
  let normalized = phone.trim();
  normalized = normalized
    .replace(/\+/g, "")
    .replace(/\s/g, "")
    .replace(/-/g, "")
    .replace(/\(/g, "")
    .replace(/\)/g, "");

  if (normalized.startsWith("05")) {
    normalized = "966" + normalized.substring(1);
  }

  return normalized;
}

export default async function ContactPage() {
  const settings = await getCompanySettings();

  const companyName = settings?.companyName?.en || "ARMS PRO";
  const phone = settings?.phone || "0551119136";
  const contactEmail = settings?.contactEmail || "INFO@SWAED.COM.SA";
  const address = settings?.address?.en || "Al Muzahimiyah - OMDB 4216 - Al Hada - 19651";

  const whatsappNumber = settings?.socialLinks?.whatsapp
    ? normalizeWhatsAppNumber(settings.socialLinks.whatsapp)
    : "";

  return (
    <>
      <section className="bg-secondary py-16 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-dark sm:text-7xl">
              Let&apos;s Build Something Exceptional
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
              Connect with our team to discuss your contracting, architecture, and light gauge steel solutions. We are ready to help execute your vision.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* Left Column: Contact Information */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-semibold text-dark tracking-tight">
                  Contact Information
                </h2>
                <p className="mt-3 text-sm text-muted">
                  Reach out through our corporate channels or visit our national address office.
                </p>
              </div>

              <div className="grid gap-8">
                <Reveal delay={0.05}>
                  <div className="border-l-2 border-accent pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Phone Number
                    </p>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="mt-2 block text-xl font-semibold text-dark hover:text-accent transition duration-200 focus:outline-none focus:text-accent"
                    >
                      {phone}
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="border-l-2 border-accent pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      Contact Us Email
                    </p>
                    <a
                      href={`mailto:${contactEmail}?subject=Contact%20from%20${encodeURIComponent(companyName)}%20Website`}
                      className="mt-2 block text-xl font-semibold text-dark hover:text-accent transition duration-200 break-all focus:outline-none focus:text-accent"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="border-l-2 border-accent pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                      National Address
                    </p>
                    <p className="mt-2 text-lg font-semibold text-dark leading-relaxed select-text">
                      {address}
                    </p>
                  </div>
                </Reveal>
              </div>

              {settings?.socialLinks && (
                <Reveal delay={0.2}>
                  <div className="pt-4 border-t border-dark/10">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted mb-4">
                      Connect on Social Media
                    </p>
                    <SocialLinks socialLinks={settings.socialLinks} variant="pill" />
                  </div>
                </Reveal>
              )}
            </div>

            {/* Right Column: Contact Action Panel */}
            <Reveal delay={0.1}>
              <div className="bg-secondary p-8 sm:p-10 rounded-2xl border border-dark/5 shadow-sm space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-dark tracking-tight">
                    Start a Conversation
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    We welcome direct communications for project proposals, tenders, or business inquiries. Click below to start an email conversation or chat with our representatives.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href={`mailto:${contactEmail}?subject=Contact%20from%20${encodeURIComponent(companyName)}%20Website`}
                    className="flex items-center justify-center gap-3 h-12 w-full bg-dark text-white hover:bg-accent hover:text-dark font-semibold rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Us
                  </a>

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp"
                      className="flex items-center justify-center gap-3 h-12 w-full border border-dark/18 hover:bg-emerald-50/50 hover:border-emerald-600 hover:text-emerald-800 text-dark font-semibold rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-emerald-600 shrink-0" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Additional / Secondary Contacts Section */}
          {(settings?.founderEmail || settings?.salesEmail) && (
            <div className="mt-20 border-t border-dark/12 pt-16">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Key Contacts
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-dark tracking-tight">
                    Direct Department Connections
                  </h3>
                  <p className="mt-3 text-sm text-muted">
                    For specialized inquiries, reach out directly to our leadership or sales divisions.
                  </p>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {settings.founderEmail && (
                  <Reveal delay={0.05}>
                    <div className="bg-secondary/60 p-6 rounded-xl border border-dark/5 hover:border-accent/40 transition duration-300">
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">Founder</p>
                      <h4 className="mt-1 text-lg font-semibold text-dark">Executive Office</h4>
                      <a
                        href={`mailto:${settings.founderEmail}`}
                        className="mt-3 block text-sm text-muted hover:text-accent font-medium transition duration-200 focus:outline-none focus:text-accent"
                      >
                        {settings.founderEmail}
                      </a>
                    </div>
                  </Reveal>
                )}

                {settings.salesEmail && (
                  <Reveal delay={0.1}>
                    <div className="bg-secondary/60 p-6 rounded-xl border border-dark/5 hover:border-accent/40 transition duration-300">
                      <p className="text-xs font-bold uppercase tracking-wider text-accent">Sales & Business Development</p>
                      <h4 className="mt-1 text-lg font-semibold text-dark">Manager Office</h4>
                      <a
                        href={`mailto:${settings.salesEmail}`}
                        className="mt-3 block text-sm text-muted hover:text-accent font-medium transition duration-200 focus:outline-none focus:text-accent"
                      >
                        {settings.salesEmail}
                      </a>
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
