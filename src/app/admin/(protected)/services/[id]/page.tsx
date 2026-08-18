import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ServiceForm } from "@/components/admin/ServiceForm";
import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params;
  await dbConnect();

  const service = await Service.findById(id).lean();
  if (!service) {
    notFound();
  }

  // Safely serialize database model for client form
  const serializedService = {
    _id: String(service._id),
    name: {
      en: service.name.en,
      ar: service.name.ar || "",
    },
    slug: service.slug,
    shortDescription: {
      en: service.shortDescription.en,
      ar: service.shortDescription.ar || "",
    },
    overview: {
      en: service.overview.en,
      ar: service.overview.ar || "",
    },
    details: (service.details || []).map((d: { en: string; ar?: string }) => ({
      en: d.en,
      ar: d.ar || "",
    })),
    capabilitiesTitle: {
      en: service.capabilitiesTitle?.en || "",
      ar: service.capabilitiesTitle?.ar || "",
    },
    capabilities: (service.capabilities || []).map((c: { en: string; ar?: string }) => ({
      en: c.en,
      ar: c.ar || "",
    })),
    benefitsTitle: {
      en: service.benefitsTitle?.en || "",
      ar: service.benefitsTitle?.ar || "",
    },
    benefits: (service.benefits || []).map(
      (b: {
        title: { en: string; ar?: string };
        text: { en: string; ar?: string };
      }) => ({
        title: {
          en: b.title.en,
          ar: b.title.ar || "",
        },
        text: {
          en: b.text.en,
          ar: b.text.ar || "",
        },
      })
    ),
    coverImage: {
      url: service.coverImage.url,
      publicId: service.coverImage.publicId,
    },
    gallery: (service.gallery || []).map((g: { url: string; publicId: string }) => ({
      url: g.url,
      publicId: g.publicId,
    })),
    video: service.video
      ? {
          url: service.video.url,
          publicId: service.video.publicId,
        }
      : undefined,
    featured: !!service.featured,
    status: service.status,
    displayOrder: service.displayOrder || 0,
  };

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Offerings
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Edit Service
          </h1>
          <p className="mt-2 text-sm text-muted">
            Modify service catalog details, facts, capabilities, cover media,
            and gallery images.
          </p>
        </div>

        {/* Reusable Form */}
        <ServiceForm initialData={serializedService} />
      </Container>
    </main>
  );
}
