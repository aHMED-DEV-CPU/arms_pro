export type Project = {
  slug: string;
  title: string;
  folder: string;
  category?: string;
};

export const projects: Project[] = [
  { slug: "project-01", title: "Featured Project 01", folder: "project-01" },
  { slug: "project-02", title: "Featured Project 02", folder: "project-02" },
  { slug: "project-03", title: "Featured Project 03", folder: "project-03" },
  { slug: "project-04", title: "Featured Project 04", folder: "project-04" },
  { slug: "project-05", title: "Featured Project 05", folder: "project-05" },
  { slug: "project-06", title: "Featured Project 06", folder: "project-06" },
  { slug: "project-07", title: "Featured Project 07", folder: "project-07" },
];

export const featuredProjectSlugs = ["project-01", "project-02", "project-03"];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
