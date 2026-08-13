"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/92 text-white backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-8">
        <Link
          href="/"
          className="relative h-14 w-40 shrink-0 overflow-hidden sm:h-16 sm:w-48"
          aria-label="ARMS PRO home"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/images/branding/logo/logo.png"
            alt="ARMS PRO logo"
            fill
            priority
            sizes="(min-width: 640px) 192px, 160px"
            className="object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-white/76 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 transition-colors duration-200 hover:text-white ${active ? "text-soft-accent" : "text-white/76"
                  }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-200 ${active ? "scale-x-100" : "scale-x-0"
                    }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <Link
          href="/contact"
          className="hidden rounded-xl border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-dark transition hover:bg-soft-accent md:inline-flex"
        >
          Get In Touch
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/20 text-white transition md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span
              className={`h-px bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""
                }`}
            />
            <span
              className={`h-px bg-current transition ${isOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
            />
          </span>
        </button>
      </Container>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-white/10 bg-dark transition-all duration-300 md:hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`border-b border-white/10 py-3 text-base font-medium transition-colors duration-200 hover:text-white ${active ? "text-soft-accent" : "text-white/82"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="mt-3 inline-flex justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-dark"
            onClick={() => setIsOpen(false)}
          >
            Get In Touch
          </Link>
        </Container>
      </div>
    </header>
  );
}
