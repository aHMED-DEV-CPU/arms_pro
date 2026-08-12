"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/92 text-white backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-8">
        <Link
          href="/"
          className="relative h-14 w-44 shrink-0 brightness-0 invert sm:w-48"
          aria-label="ARMS PRO home"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/images/branding/logo/logo.webp"
            alt="ARMS PRO logo"
            fill
            priority
            sizes="(min-width: 640px) 192px, 176px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium text-white/76 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-soft-accent"
            >
              {link.label}
            </Link>
          ))}
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
      </Container>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-white/10 bg-dark transition-all duration-300 md:hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-base font-medium text-white/82 transition hover:text-soft-accent"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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
