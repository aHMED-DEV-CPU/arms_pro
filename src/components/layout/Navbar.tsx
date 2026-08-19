"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { t, TranslationLang, localizedPath } from "@/lib/i18n";

const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/about", labelKey: "about" as const },
  { href: "/services", labelKey: "services" as const },
  { href: "/projects", labelKey: "projects" as const },
];

interface NavbarProps {
  logoUrl?: string;
  companyName?: string;
  lang?: TranslationLang;
}

export function Navbar({ logoUrl, companyName = "ARMS PRO", lang = "en" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function isActive(localizedHref: string) {
    if (localizedHref === `/${lang}`) {
      return pathname === `/${lang}`;
    }
    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/92 text-white backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-8">
        <Link
          href={localizedPath(lang, "/")}
          className="relative h-14 w-40 shrink-0 flex items-center overflow-hidden sm:h-16 sm:w-48"
          aria-label={t("nav", "ariaHome", lang)}
          onClick={() => setIsOpen(false)}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${companyName} logo`}
              fill
              priority
              sizes="(min-width: 640px) 192px, 160px"
              className="object-contain"
            />
          ) : (
            <span className="text-lg font-semibold tracking-wider text-white">
              {companyName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-white/76 md:flex">
          {navLinks.map((link) => {
            const locHref = localizedPath(lang, link.href);
            const active = isActive(locHref);

            return (
              <Link
                key={link.href}
                href={locHref}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 transition-colors duration-200 hover:text-white ${
                  active ? "text-soft-accent" : "text-white/76"
                }`}
              >
                {t("nav", link.labelKey, lang)}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Suspense fallback={<div className="w-12 h-6" />}>
            <LanguageSwitcher currentLang={lang} />
          </Suspense>
          <Link
            href={localizedPath(lang, "/contact")}
            className="rounded-xl border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-soft-accent"
          >
            {t("nav", "getInTouch", lang)}
          </Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Suspense fallback={<div className="w-12 h-6" />}>
            <LanguageSwitcher currentLang={lang} />
          </Suspense>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white transition"
            aria-label={t("nav", "ariaToggle", lang)}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
              <span
                className={`h-px bg-current transition ${
                  isOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-px bg-current transition ${isOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px bg-current transition ${
                  isOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-white/10 bg-dark transition-all duration-300 md:hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => {
            const locHref = localizedPath(lang, link.href);
            const active = isActive(locHref);

            return (
              <Link
                key={link.href}
                href={locHref}
                aria-current={active ? "page" : undefined}
                className={`border-b border-white/10 py-3 text-base font-medium transition-colors duration-200 hover:text-white ${
                  active ? "text-soft-accent" : "text-white/82"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {t("nav", link.labelKey, lang)}
              </Link>
            );
          })}
          <Link
            href={localizedPath(lang, "/contact")}
            className="mt-3 inline-flex justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-dark"
            onClick={() => setIsOpen(false)}
          >
            {t("nav", "getInTouch", lang)}
          </Link>
        </Container>
      </div>
    </header>
  );
}
