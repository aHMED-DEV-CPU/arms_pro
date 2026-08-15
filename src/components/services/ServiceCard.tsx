import Image from "next/image";
import Link from "next/link";
import type { IService } from "@/types";

type ServiceCardProps = {
  service: IService;
  image?: string;
  index?: number;
};

export function ServiceCard({ service, image, index }: ServiceCardProps) {
  const number =
    typeof index === "number" ? String(index + 1).padStart(2, "0") : null;
  const href = `/services/${service.slug}`;

  return (
    <article className="group flex h-full flex-col">
      {image ? (
        <Link
          href={href}
          className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-secondary"
          aria-label={`View ${service.name.en}`}
        >
          <Image
            src={image}
            alt={`${service.name.en} service`}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col border-b border-dark/12 py-6">
        {number ? (
          <p className="mb-4 text-xs font-semibold tracking-[0.28em] text-accent">
            {number}
          </p>
        ) : null}
        <h3 className="text-2xl font-semibold leading-tight text-dark transition group-hover:text-accent">
          <Link href={href}>{service.name.en}</Link>
        </h3>
        <p className="mt-4 leading-7 text-muted">{service.shortDescription.en}</p>
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-accent transition hover:text-dark"
        >
          <span>View Service</span>
          <span className="transition group-hover:translate-x-1" aria-hidden="true">
            -&gt;
          </span>
        </Link>
      </div>
    </article>
  );
}

