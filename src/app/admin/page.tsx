import { Container } from "@/components/ui/Container";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen items-center py-20">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-dark">
          Admin Dashboard
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Admin functionality will be implemented in a later phase.
        </p>
      </Container>
    </main>
  );
}
