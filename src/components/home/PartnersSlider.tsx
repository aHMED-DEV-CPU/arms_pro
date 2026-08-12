import Image from "next/image";
import type { PublicMediaFile } from "@/lib/utils/media";
import { labelFromFileName } from "@/lib/utils/media";

type PartnersSliderProps = {
  logos: PublicMediaFile[];
};

export function PartnersSlider({ logos }: PartnersSliderProps) {
  if (logos.length === 0) {
    return null;
  }

  const repeatedLogos = [...logos, ...logos];

  return (
    <div className="overflow-hidden border-y border-dark/10 bg-background py-8">
      <div className="animate-logo-slider flex w-max items-center gap-10 pr-10">
        {repeatedLogos.map((logo, index) => (
          <div
            key={`${logo.src}-${index}`}
            className="relative h-20 w-44 shrink-0 opacity-65 grayscale transition hover:opacity-100 hover:grayscale-0"
            aria-hidden={index >= logos.length}
          >
            <Image
              src={logo.src}
              alt={
                index >= logos.length ? "" : `${labelFromFileName(logo.name)} logo`
              }
              fill
              sizes="160px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
