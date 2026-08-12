"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type PublicMediaFile = {
  name: string;
  src: string;
};

type ImageLightboxProps = {
  images: PublicMediaFile[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const showPrevious = useCallback(() => {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, showNext, showPrevious]);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  function handleTouchEnd(clientX: number) {
    if (touchStartX === null) {
      return;
    }

    const distance = touchStartX - clientX;
    const threshold = 50;

    if (distance > threshold) {
      showNext();
    }

    if (distance < -threshold) {
      showPrevious();
    }

    setTouchStartX(null);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-md border border-white/20 bg-black/35 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-dark"
        aria-label="Close image gallery"
        onClick={onClose}
      >
        Close x
      </button>

      <button
        type="button"
        className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white hover:text-dark"
        aria-label="Previous image"
        onClick={showPrevious}
      >
        &larr;
      </button>

      <div
        className="relative h-[80vh] w-full max-w-6xl"
        onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.name}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <button
        type="button"
        className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl font-semibold text-white backdrop-blur transition hover:bg-white hover:text-dark"
        aria-label="Next image"
        onClick={showNext}
      >
        &rarr;
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/45 px-4 py-2 text-sm font-semibold text-white/85">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}
