import Image from "next/image";
import Link from "next/link";
import type { IProject } from "@/types";

type ProjectCardProps = {
  project: IProject;
  image?: string;
  index?: number;
  large?: boolean;
};

export function ProjectCard({
  project,
  image,
  index,
  large = false,
}: ProjectCardProps) {
  const number =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : null;
  const href = `/projects/${project.slug}`;

  return (
    <article className="group flex h-full flex-col">
      {image ? (
        <Link
          href={href}
          className={`relative block overflow-hidden rounded-2xl bg-secondary ${
            large ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
          aria-label={`View ${project.title.en}`}
        >
          <Image
            src={image}
            alt={project.title.en}
            fill
            sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col border-b border-dark/12 py-6">
        {project.category?.en ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {project.category.en}
          </p>
        ) : null}
        {number ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-accent">
            {number}
          </p>
        ) : null}
        <h3 className="text-2xl font-semibold text-dark transition group-hover:text-accent">
          <Link href={href}>{project.title.en}</Link>
        </h3>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-accent transition hover:text-dark"
        >
          <span>View Project</span>
          <span className="transition group-hover:translate-x-1" aria-hidden="true">
            -&gt;
          </span>
        </Link>
      </div>
    </article>
  );
}
