import { Container } from "@/components/ui/Container";
import { CompanySettingsForm } from "@/components/admin/CompanySettingsForm";
import dbConnect from "@/lib/db/mongoose";
import CompanySettings from "@/models/CompanySettings";

export default async function AdminSettingsPage() {
  await dbConnect();

  // Retrieve current settings
  let settings = await CompanySettings.findOne().lean();
  if (!settings) {
    settings = {
      companyName: { en: "", ar: "" },
      about: { en: "", ar: "" },
      phone: "",
      email: "",
      founderEmail: "",
      salesEmail: "",
      contactEmail: "",
      address: { en: "", ar: "" },
      commercialRegistration: "",
      unifiedEstablishmentNumber: "",
      vatNumber: "",
      socialLinks: {
        instagram: "",
        linkedin: "",
        x: "",
        facebook: "",
        youtube: "",
        whatsapp: "",
        tiktok: "",
      },
    };
  }

  // Safely serialize for Client Component
  const serializedSettings = {
    companyName: {
      en: settings.companyName?.en || "",
      ar: settings.companyName?.ar || "",
    },
    about: settings.about
      ? {
          en: settings.about.en || "",
          ar: settings.about.ar || "",
        }
      : undefined,
    aboutParagraphs: (settings.aboutParagraphs || []).map((p: any) => ({
      en: p.en || "",
      ar: p.ar || "",
    })),
    phone: settings.phone || "",
    email: settings.email || "",
    founderEmail: settings.founderEmail || "",
    salesEmail: settings.salesEmail || "",
    contactEmail: settings.contactEmail || settings.email || "",
    address: {
      en: settings.address?.en || "",
      ar: settings.address?.ar || "",
    },
    commercialRegistration: settings.commercialRegistration || "",
    unifiedEstablishmentNumber: settings.unifiedEstablishmentNumber || "",
    vatNumber: settings.vatNumber || "",
    socialLinks: {
      instagram: settings.socialLinks?.instagram || "",
      linkedin: settings.socialLinks?.linkedin || "",
      x: settings.socialLinks?.x || "",
      facebook: settings.socialLinks?.facebook || "",
      youtube: settings.socialLinks?.youtube || "",
      whatsapp: settings.socialLinks?.whatsapp || "",
      tiktok: settings.socialLinks?.tiktok || "",
    },
    logo: settings.logo
      ? {
          url: settings.logo.url,
          publicId: settings.logo.publicId,
        }
      : undefined,
    heroImage: settings.heroImage
      ? {
          url: settings.heroImage.url,
          publicId: settings.heroImage.publicId,
        }
      : undefined,
    aboutImage: settings.aboutImage
      ? {
          url: settings.aboutImage.url,
          publicId: settings.aboutImage.publicId,
        }
      : undefined,
  };

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Configurations
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Company Profile & Settings
          </h1>
          <p className="mt-2 text-sm text-muted">
            Configure contact parameters, localized descriptions, government
            registration details, social links, and assets.
          </p>
        </div>

        {/* Company Settings Form */}
        <CompanySettingsForm initialSettings={serializedSettings} />
      </Container>
    </main>
  );
}
