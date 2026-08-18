"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/gallery/ImageLightbox";
import { t, TranslationLang } from "@/lib/i18n";

type PublicMediaFile = {
  name: string;
  src: string;
};

type ImageGalleryProps = {
  images: PublicMediaFile[];
  title: string;
  lang?: TranslationLang;
};

export function ImageGallery({ images, title, lang = "en" }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const visibleImages = images.slice(0, 3);
  const remainingCount = Math.max(images.length - visibleImages.length, 0);

  function openLightbox(index: number) {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  }

  return (
    <>
      <div className="hidden grid-cols-3 gap-4 lg:grid">
        <GalleryButton
          image={images[0]}
          index={0}
          title={title}
          className="col-span-2 aspect-[16/10]"
          onOpen={openLightbox}
          sizes="(min-width: 1024px) 66vw, 100vw"
        />

        <div className="grid gap-4">
          {visibleImages.slice(1).map((image, offset) => {
            const index = offset + 1;
            const isLastVisible = index === visibleImages.length - 1;

            return (
              <GalleryButton
                key={image.src}
                image={image}
                index={index}
                title={title}
                className="aspect-[16/10]"
                onOpen={openLightbox}
                overlayText={
                  isLastVisible && remainingCount > 0
                    ? `+ ${remainingCount} ${t("lightbox", "moreText", lang)}`
                    : undefined
                }
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            );
          })}
        </div>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl bg-secondary text-start"
          aria-label={`Open selected ${title} image in gallery`}
          onClick={() => openLightbox(selectedIndex)}
        >
          <Image
            src={images[selectedIndex].src}
            alt={`${title} - ${labelFromFileName(images[selectedIndex].name)}`}
            fill
            sizes="100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-3 right-3 rounded-lg bg-black/65 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
            {t("lightbox", "viewGallery", lang)}
          </span>
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/45 px-3 py-2 text-xs font-semibold text-white/90">
            {selectedIndex + 1} / {images.length}
          </span>
        </button>

        {images.length > 1 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-secondary transition ${
                  selectedIndex === index
                    ? "ring-2 ring-accent"
                    : "opacity-75 hover:opacity-100"
                }`}
                aria-label={`Select ${title} image ${index + 1}`}
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={image.src}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                {index === images.length - 1 && images.length > 5 ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                    + {images.length - 5} {t("lightbox", "moreText", lang)}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ImageLightbox
        key={selectedIndex}
        images={images}
        initialIndex={selectedIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        lang={lang}
      />
    </>
  );
}

type GalleryButtonProps = {
  image: PublicMediaFile;
  index: number;
  title: string;
  className: string;
  sizes: string;
  overlayText?: string;
  onOpen: (index: number) => void;
};

function GalleryButton({
  image,
  index,
  title,
  className,
  sizes,
  overlayText,
  onOpen,
}: GalleryButtonProps) {
  return (
    <button
      type="button"
      className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-secondary text-start ${className}`}
      aria-label={`Open ${title} image ${index + 1}`}
      onClick={() => onOpen(index)}
    >
      <Image
        src={image.src}
        alt={`${title} - ${labelFromFileName(image.name)}`}
        fill
        sizes={sizes}
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      {overlayText ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
          {overlayText}
        </span>
      ) : null}
    </button>
  );
}

function labelFromFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
