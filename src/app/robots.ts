import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProdEnv = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

  // If this is a preview or non-production environment, disallow all crawling
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/api/*"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
