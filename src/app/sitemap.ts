import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import dbConnect from "@/lib/db/mongoose";
import Service from "@/models/Service";
import Project from "@/models/Project";
import { IService, IProject } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  let services: IService[] = [];
  let projects: IProject[] = [];

  try {
    await dbConnect();
    services = await Service.find({ status: "published" }).lean();
    projects = await Project.find().lean();
  } catch (error) {
    console.error("CRITICAL: Failed to query MongoDB database for sitemap paths.", error);
    // Propagate DB failure cleanly to prevent empty sitemaps from caching
    throw error;
  }

  const locales = ["en", "ar"];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Static Pages
  const staticPaths = ["", "/about", "/services", "/projects", "/contact"];
  for (const locale of locales) {
    for (const p of staticPaths) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${p}`,
        // Static pages do not define lastModified to prevent artificial timestamps
      });
    }
  }

  // 2. Dynamic Services
  for (const locale of locales) {
    for (const service of services) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/services/${service.slug}`,
        lastModified: service.updatedAt ? new Date(service.updatedAt) : undefined,
      });
    }
  }

  // 3. Dynamic Projects
  for (const locale of locales) {
    for (const project of projects) {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}/projects/${project.slug}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : undefined,
      });
    }
  }

  return sitemapEntries;
}
