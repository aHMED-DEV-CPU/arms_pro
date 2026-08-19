import Image from "next/image";
import Link from "next/link";
import type { IProject } from "@/types";
import { t, getLocalizedValue, TranslationLang, localizedPath } from "@/lib/i18n";

type ProjectCardProps = {
  project: IProject;
  image?: string;
  index?: number;
  large?: boolean;
  lang?: TranslationLang;
};

export function ProjectCard({
  project,
  image,
  index,
  large = false,
  lang = "en",
}: ProjectCardProps) {
  const number =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : null;
  const href = localizedPath(lang, `/projects/${project.slug}`);

  const title = getLocalizedValue(project.title, lang);
  const category = getLocalizedValue(project.category, lang);

  return (
    <article className="group flex h-full flex-col">
      {image ? (
        <Link
          href={href}
          className={`relative block overflow-hidden rounded-2xl bg-secondary ${
            large ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
          aria-label={`${t("projects", "viewProject", lang)} ${title}`}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 58vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col border-b border-dark/12 py-6">
        {category ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {category}
          </p>
        ) : null}
        {number ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-accent">
            {number}
          </p>
        ) : null}
        <h3 className="text-2xl font-semibold text-dark transition group-hover:text-accent">
          <Link href={href}>{title}</Link>
        </h3>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-accent transition hover:text-dark"
        >
          <span>{t("projects", "viewProject", lang)}</span>
          <span className="transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true">
            {lang === "ar" ? "<-" : "->"}
          </span>
        </Link>
      </div>
    </article>
  );
}
