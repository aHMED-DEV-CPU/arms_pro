import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProjectsList } from "@/components/admin/ProjectsList";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

export default async function AdminProjectsPage() {
  await dbConnect();

  // Fetch projects sorted by displayOrder
  const projects = await Project.find({})
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  // Safely serialize database documents for Client Component
  const serializedProjects = projects.map((p) => ({
    _id: String(p._id),
    title: {
      en: p.title.en,
      ar: p.title.ar || "",
    },
    slug: p.slug,
    category: {
      en: p.category.en,
      ar: p.category.ar || "",
    },
    coverImage: {
      url: p.coverImage.url,
      publicId: p.coverImage.publicId,
    },
    status: p.status,
    featured: !!p.featured,
    displayOrder: p.displayOrder || 0,
  }));

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-dark/12 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Portfolio
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
              Projects Showcase
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage architectural portfolio details, status indicators, and
              drag-and-drop rows to order the showcase.
            </p>
          </div>
          <div>
            <Link
              href="/admin/projects/new"
              className="inline-flex rounded-xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark"
            >
              Add Project
            </Link>
          </div>
        </div>

        {/* Dynamic Sortable List Component */}
        <div className="mt-10">
          <ProjectsList initialProjects={serializedProjects} />
        </div>
      </Container>
    </main>
  );
}
