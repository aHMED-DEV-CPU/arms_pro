import { Container } from "@/components/ui/Container";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <main className="py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="border-b border-dark/12 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Offerings
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-dark tracking-tight">
            Add New Service
          </h1>
          <p className="mt-2 text-sm text-muted">
            Create a new service offering. Enter both English and Arabic content
            where required.
          </p>
        </div>

        {/* Reusable Form */}
        <ServiceForm />
      </Container>
    </main>
  );
}
