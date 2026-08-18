import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getCompanySettings } from "@/lib/data/company";
import { SocialLinks } from "./SocialLinks";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export async function Footer() {
  const settings = await getCompanySettings();

  const companyName = settings?.companyName?.en || "ARMS PRO";
  const phone = settings?.phone || "0551119136";
  const cr = settings?.commercialRegistration || "1111103343";
  const uen = settings?.unifiedEstablishmentNumber || "7039472662";
  const vat = settings?.vatNumber || "312627669500003";
  const address = settings?.address?.en || "Al Muzahimiyah – OMDB 4216 – Al Hada – 19651";

  return (
    <footer className="bg-dark py-12 text-sm text-white/62 sm:py-14">
      <Container>
        <div className="border-b border-white/12 pb-7">
          <p className="text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl">
            {companyName}
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">
            Integrated construction, design and architectural solutions.
          </p>
          <div className="mt-6">
            <SocialLinks socialLinks={settings?.socialLinks} />
          </div>
        </div>

        <div className="grid gap-8 py-8 md:grid-cols-[1.05fr_0.8fr_0.9fr_1.35fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-soft-accent">
              {companyName}
            </p>
            <p className="mt-4 max-w-sm leading-7 text-white/60">
              A Saudi group for contracting, architecture, interiors and
              specialized construction solutions.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Quick Links
            </h2>
            <nav className="mt-4 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Contact
            </h2>
            <div className="mt-4 space-y-4">
              <p className="font-medium text-white/82">{phone}</p>
              
              {settings?.founderEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Founder</p>
                  <a
                    href={`mailto:${settings.founderEmail}`}
                    className="transition hover:text-white block mt-0.5 text-xs text-white/60 focus:outline-none focus:text-white"
                  >
                    {settings.founderEmail}
                  </a>
                </div>
              )}

              {settings?.salesEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Sales & Biz Dev</p>
                  <a
                    href={`mailto:${settings.salesEmail}`}
                    className="transition hover:text-white block mt-0.5 text-xs text-white/60 focus:outline-none focus:text-white"
                  >
                    {settings.salesEmail}
                  </a>
                </div>
              )}

              {settings?.contactEmail && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Contact Us</p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="transition hover:text-white block mt-0.5 text-xs text-white/60 focus:outline-none focus:text-white"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Company Information
            </h2>
            <dl className="mt-4 grid gap-2 text-xs leading-6 text-white/55">
              <div>
                <dt className="font-medium text-white/82">
                  Commercial Registration
                </dt>
                <dd>{cr}</dd>
              </div>
              <div>
                <dt className="font-medium text-white/82">
                  Unified Establishment Number
                </dt>
                <dd>{uen}</dd>
              </div>
              <div>
                <dt className="font-medium text-white/82">VAT Number</dt>
                <dd>{vat}</dd>
              </div>
              <div>
                <dt className="font-medium text-white/82">National Address</dt>
                <dd>{address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="border-t border-white/12 pt-6 text-xs uppercase tracking-[0.16em] text-white/42">
          <p>{companyName} - Public portfolio foundation</p>
        </div>
      </Container>
    </footer>
  );
}
