import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProjectForm } from "@/components/admin/ProjectForm";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  await dbConnect();

  const project = await Project.findById(id).lean();
  if (!project) {
    notFound();
  }

  // Safely serialize database model for client form
  const serializedProject = {
    _id: String(project._id),
    title: {
      en: project.title.en,
      ar: project.title.ar || "",
    },
    slug: project.slug,
    category: {
      en: project.category.en,
      ar: project.category.ar || "",
    },
    shortDescription: {
      en: project.shortDescription.en,
      ar: project.shortDescription.ar || "",
    },
    fullDescription: {
      en: project.fullDescription.en,
      ar: project.fullDescription.ar || "",
    },
    coverImage: {
      url: project.coverImage.url,
      publicId: project.coverImage.publicId,
    },
    gallery: (project.gallery || []).map((g: { url: string; publicId: string }) => ({
      url: g.url,
      publicId: g.publicId,
    })),
    video: project.video
      ? {
          url: project.video.url,
          publicId: project.video.publicId,
        }
      : undefined,
    featured: !!project.featured,
    status: project.status,
    displayOrder: project.displayOrder || 0,
  };

  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Portfolio
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Edit Project
          </h1>
          <p className="mt-2 text-sm text-muted">
            Modify project catalog details, description, cover media, status,
            and gallery images.
          </p>
        </div>

        {/* Reusable Form */}
        <ProjectForm initialData={serializedProject} />
      </Container>
    </main>
  );
}
