import { Container } from "@/components/ui/Container";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Portfolio
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Add New Project
          </h1>
          <p className="mt-2 text-sm text-muted">
            Publish a new project work. Enter details in both English and Arabic.
          </p>
        </div>

        {/* Form */}
        <ProjectForm />
      </Container>
    </main>
  );
}
