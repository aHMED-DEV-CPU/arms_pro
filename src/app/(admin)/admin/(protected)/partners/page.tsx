import { Container } from "@/components/ui/Container";
import { PartnersManager } from "@/components/admin/PartnersManager";
import dbConnect from "@/lib/db/mongoose";
import Partner from "@/models/Partner";

export default async function AdminPartnersPage() {
  await dbConnect();

  // Fetch partners
  const partners = await Partner.find({}).sort({ createdAt: -1 }).lean();

  // Serialize database documents
  const serializedPartners = partners.map((p) => ({
    _id: String(p._id),
    name: p.name,
    logo: {
      url: p.logo.url,
      publicId: p.logo.publicId,
    },
    websiteUrl: p.websiteUrl || "",
    active: !!p.active,
  }));

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Associates
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Partners & Clients
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage client logos, toggle active states, and configure optional
            website redirection URLs.
          </p>
        </div>

        {/* Partners Manager Client Component */}
        <div className="mt-10">
          <PartnersManager initialPartners={serializedPartners} />
        </div>
      </Container>
    </main>
  );
}
