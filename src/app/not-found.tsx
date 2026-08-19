import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-sans-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${manrope.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col justify-center bg-background py-16 sm:py-24 font-sans text-center">
        <Container>
          <div className="mx-auto max-w-2xl">
            {/* Accent Badge */}
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Error 404
            </span>

            {/* Heading */}
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-dark sm:text-6xl tracking-tight">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg leading-relaxed text-[#6b6d68]">
              The page you are looking for is not available or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/en"
                className="rounded-lg bg-dark px-6 py-3 text-sm font-semibold text-white hover:bg-accent hover:text-dark transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </Container>
      </body>
    </html>
  );
}
