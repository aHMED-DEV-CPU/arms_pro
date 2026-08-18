import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata = {
  title: "Page Not Found | ARMS PRO",
  description: "The page you are looking for is not available.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          {/* Accent Badge */}
          <span className="inline-flex rounded-full bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Error 404
          </span>

          {/* Heading */}
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-dark sm:text-6xl tracking-tight">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-relaxed text-muted">
            The page you are looking for may have been moved, renamed, or is no longer available. Let us help you find what you need.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-dark px-6 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark focus:outline-none focus:ring-2 focus:ring-accent min-w-[160px]"
            >
              Back to Home
            </Link>

            <Link
              href="/services"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-dark/18 px-6 text-sm font-semibold text-dark transition hover:bg-dark/5 hover:border-dark/30 focus:outline-none focus:ring-1 focus:ring-accent min-w-[160px]"
            >
              View Services
            </Link>

            <Link
              href="/projects"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-dark/18 px-6 text-sm font-semibold text-dark transition hover:bg-dark/5 hover:border-dark/30 focus:outline-none focus:ring-1 focus:ring-accent min-w-[160px]"
            >
              View Projects
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
