/**
 * Returns the configured production site URL from environment.
 * - In Production: Requires NEXT_PUBLIC_SITE_URL to be defined (throws error if missing).
 * - In Development: Falls back to localhost:3000 if NEXT_PUBLIC_SITE_URL is missing.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProd = process.env.NODE_ENV === "production";

  if (envUrl && envUrl.trim() !== "") {
    // Strip trailing slash
    return envUrl.trim().replace(/\/$/, "");
  }

  if (isProd) {
    throw new Error(
      "CRITICAL: NEXT_PUBLIC_SITE_URL environment variable is missing in production environment. " +
        "Please define it to prevent incorrect canonical URL generation."
    );
  }

  return "http://localhost:3000";
}

/**
 * Helper to escape special characters in serialized JSON-LD script strings
 * to prevent script injection or parsing breakage.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

export const defaultSeoMetadata = {
  home: {
    title: "ARMS PRO | Contracting, Design & Construction",
    description: "Saudi construction, architecture, interior finishing, and contracting company delivering premium structural and architectural solutions.",
  },
  about: {
    title: "About Us | ARMS PRO",
    description: "Learn about the values, capabilities, and heritage of ARMS PRO, a Saudi group for specialized construction and architectural design.",
  },
  services: {
    title: "Services | ARMS PRO",
    description: "Explore our construction capabilities, light gauge steel systems, facade stonework, and interior design solutions.",
  },
  projects: {
    title: "Projects | ARMS PRO",
    description: "View our contracting and structural design portfolio across residential, commercial, and industrial sectors in Saudi Arabia.",
  },
  contact: {
    title: "Contact Us | ARMS PRO",
    description: "Get in touch with our team for business proposals, tenders, or inquiries regarding our engineering and structural solutions.",
  },
} as const;

/**
 * Returns localized canonical alternates (canonical + alternate hreflangs)
 * for a given path and active locale.
 */
export function getLocalizedAlternates(locale: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const enUrl = `/en${normalizedPath === "/" ? "" : normalizedPath}`;
  const arUrl = `/ar${normalizedPath === "/" ? "" : normalizedPath}`;
  return {
    canonical: `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`,
    languages: {
      en: enUrl,
      ar: arUrl,
      "x-default": enUrl,
    },
  };
}
