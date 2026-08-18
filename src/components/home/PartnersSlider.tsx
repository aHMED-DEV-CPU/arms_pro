"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type PartnerLogo = {
  name: string;
  src: string;
  websiteUrl?: string;
};

type PartnersSliderProps = {
  logos: PartnerLogo[];
};

export function PartnersSlider({ logos }: PartnersSliderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    }
    return false;
  });

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef<number | null>(null);

  const N = logos.length;

  // 1. Detect touch capability matching CSS hover rules
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");

    const handler = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches);
      if (!e.matches) {
        setActiveIndex(null);
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // 2. Mobile Center Detection Throttled requestAnimationFrame Loop
  useEffect(() => {
    if (!isTouchDevice || N === 0) {
      return;
    }

    let activeFrameId: number;
    let lastTime = 0;
    const interval = 100; // Throttle layout reads to every 100ms

    const updateCenterPartner = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;

      if (delta >= interval) {
        lastTime = time;

        if (viewportRef.current && trackRef.current) {
          const viewportRect = viewportRef.current.getBoundingClientRect();
          const viewportCenter = viewportRect.left + viewportRect.width / 2;

          let closestNormalizedIndex = 0;
          let minDistance = Infinity;

          const children = trackRef.current.children;
          for (let i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            const elementCenter = rect.left + rect.width / 2;
            const distance = Math.abs(elementCenter - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              closestNormalizedIndex = i % N;
            }
          }

          if (closestNormalizedIndex !== activeIndexRef.current) {
            activeIndexRef.current = closestNormalizedIndex;
            setActiveIndex(closestNormalizedIndex);
          }
        }
      }

      activeFrameId = requestAnimationFrame(updateCenterPartner);
    };

    activeFrameId = requestAnimationFrame(updateCenterPartner);

    return () => {
      cancelAnimationFrame(activeFrameId);
      activeIndexRef.current = null;
      // Clear activeIndex asynchronously to comply with react-hooks/set-state-in-effect
      requestAnimationFrame(() => {
        setActiveIndex(null);
      });
    };
  }, [isTouchDevice, N]);

  if (N === 0) {
    return null;
  }

  const repeatedLogos = [...logos, ...logos];

  return (
    <div
      ref={viewportRef}
      className="overflow-hidden border-y border-dark/10 bg-background py-8"
    >
      <div
        ref={trackRef}
        className="animate-logo-slider flex w-max items-center gap-10 pr-10"
      >
        {repeatedLogos.map((logo, index) => {
          const normalized = index % N;
          const isItemActive = activeIndex !== null && normalized === activeIndex;
          const hasUrl = !!logo.websiteUrl;
          const Tag = hasUrl ? "a" : "div";

          const extraProps = hasUrl
            ? {
                href: logo.websiteUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": `Visit ${logo.name} website`,
              }
            : {
                "aria-hidden": index >= N,
              };

          // Active/inactive class matching desktop hover and mobile center
          const activeClass =
            activeIndex === null
              ? "opacity-65 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-105"
              : isItemActive
              ? "opacity-100 grayscale-0 scale-105"
              : "opacity-35 grayscale";

          return (
            <Tag
              key={`${logo.src}-${index}`}
              {...extraProps}
              onMouseEnter={() => {
                if (!isTouchDevice) {
                  setActiveIndex(normalized);
                }
              }}
              onMouseLeave={() => {
                if (!isTouchDevice) {
                  setActiveIndex(null);
                }
              }}
              className={`relative h-20 w-44 shrink-0 transition-all duration-300 ${activeClass}`}
            >
              <Image
                src={logo.src}
                alt={index >= N ? "" : `${logo.name} logo`}
                fill
                sizes="160px"
                className="object-contain"
              />
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
