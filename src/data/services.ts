export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  imageFolder: string;
  fullDescription: string;
};

export const services: Service[] = [
  {
    slug: "building",
    title: "General Contracting & Construction",
    imageFolder: "building",
    shortDescription:
      "Integrated construction solutions delivered with precise planning, quality execution and attention to every stage of the project.",
    fullDescription:
      "Integrated construction solutions delivered with precise planning, quality execution and attention to every stage of the project.",
  },
  {
    slug: "building-designs",
    title: "Building & Architectural Design",
    imageFolder: "building designs",
    shortDescription:
      "Architectural design solutions shaped around function, proportion and refined project execution.",
    fullDescription:
      "Architectural design solutions shaped around function, proportion and refined project execution.",
  },
  {
    slug: "khema",
    title: "Event Tents & Outdoor Structures",
    imageFolder: "Khema",
    shortDescription:
      "Outdoor structure solutions for event, hospitality and temporary-use environments.",
    fullDescription:
      "Outdoor structure solutions for event, hospitality and temporary-use environments.",
  },
  {
    slug: "light-gauge-steel",
    title: "Light Gauge Steel Systems",
    imageFolder: "Light Gauge Steel",
    shortDescription:
      "Efficient lightweight steel construction solutions designed for modern, durable and flexible buildings.",
    fullDescription:
      "Efficient lightweight steel construction solutions designed for modern, durable and flexible buildings.",
  },
  {
    slug: "modern-villa-architecture",
    title: "Modern Villa Architecture",
    imageFolder: "Modern Villa Architecture",
    shortDescription:
      "Modern villa concepts that balance clean architectural forms with practical living spaces.",
    fullDescription:
      "Modern villa concepts that balance clean architectural forms with practical living spaces.",
  },
  {
    slug: "modular-cabins-mobile-units",
    title: "Modular Cabins & Mobile Units",
    imageFolder: "Modular Cabins & Mobile Units",
    shortDescription:
      "Portable and modular unit solutions for flexible spaces, site support and rapid deployment.",
    fullDescription:
      "Portable and modular unit solutions for flexible spaces, site support and rapid deployment.",
  },
  {
    slug: "our-work-from-inside",
    title: "Interior Fit-Out & Finishing",
    imageFolder: "our work from inside",
    shortDescription:
      "High-end interior finishing and fit-out solutions for commercial, hospitality and residential spaces.",
    fullDescription:
      "High-end interior finishing and fit-out solutions for commercial, hospitality and residential spaces.",
  },
  {
    slug: "site-progress-construction",
    title: "Construction & Site Execution",
    imageFolder: "Site Progress & Construction",
    shortDescription:
      "On-site execution services focused on coordination, progress and consistent construction quality.",
    fullDescription:
      "On-site execution services focused on coordination, progress and consistent construction quality.",
  },
  {
    slug: "foam-stone",
    title: "Foam Stone & Architectural Facades",
    imageFolder: "foam-stone",
    shortDescription:
      "Lightweight architectural facade systems combining design flexibility, insulation performance, efficient installation and refined exterior finishes.",
    fullDescription:
      "Lightweight architectural facade systems combining design flexibility, insulation performance, efficient installation and refined exterior finishes.",
  },
];

export const featuredServiceSlugs = [
  "building",
  "our-work-from-inside",
  "light-gauge-steel",
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
