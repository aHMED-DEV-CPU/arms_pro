import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ServicesList } from "@/components/admin/ServicesList";
import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";

export default async function AdminServicesPage() {
  await dbConnect();

  // Fetch services sorted by displayOrder
  const services = await Service.find({})
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  // Safely serialize database documents for Client Component
  const serializedServices = services.map((s) => ({
    _id: String(s._id),
    name: {
      en: s.name.en,
      ar: s.name.ar || "",
    },
    slug: s.slug,
    coverImage: {
      url: s.coverImage.url,
      publicId: s.coverImage.publicId,
    },
    status: s.status,
    featured: !!s.featured,
    displayOrder: s.displayOrder || 0,
  }));

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-dark/12 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Offerings
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
              Services Catalog
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage service details, toggle visibility, and drag-and-drop rows to
              set their display order.
            </p>
          </div>
          <div>
            <Link
              href="/admin/services/new"
              className="inline-flex rounded-xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark"
            >
              Add Service
            </Link>
          </div>
        </div>

        {/* Dynamic Sortable List Component */}
        <div className="mt-10">
          <ServicesList initialServices={serializedServices} />
        </div>
      </Container>
    </main>
  );
}
