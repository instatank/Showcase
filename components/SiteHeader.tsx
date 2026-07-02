"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import Container from "./Container";

const navLinks = [
  { href: "/#journey", label: "Journey", index: "01" },
  { href: "/#builds", label: "Builds", index: "02" },
  { href: "/#process", label: "Process", index: "03" },
  { href: "/#now", label: "Now", index: "04" },
  { href: "/#beyond", label: "Beyond", index: "05" },
];

/**
 * Sticky glass header. Numbered mono nav mirrors the section numbering on the
 * page; inline on desktop, a slide-down menu on mobile.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-paper/75 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-display text-base font-semibold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          {site.name}
          <span className="hidden font-mono text-xs text-accent sm:inline">
            /ai-builder
            <span className="animate-blink">_</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 font-mono text-xs tracking-wide text-muted sm:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-ink"
            >
              <span className="mr-1 text-accent/70">{l.index}.</span>
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-full bg-accent px-4 py-1.5 font-sans text-sm font-semibold text-paper transition-all hover:bg-accent-bright hover:shadow-accent-glow"
          >
            Get in touch
          </Link>
        </nav>

        {/* Mobile: CTA + menu toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/#contact"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-paper"
            onClick={() => setOpen(false)}
          >
            Get in touch
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink"
          >
            <span className="relative block h-3.5 w-4">
              <span
                className={`absolute left-0 block h-0.5 w-4 bg-ink transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-4 bg-ink transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-4 bg-ink transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* Mobile menu panel */}
      <div
        className={`overflow-hidden border-t border-hairline/60 bg-paper/95 backdrop-blur-md transition-[max-height] duration-300 ease-out sm:hidden ${
          open ? "max-h-72" : "max-h-0"
        }`}
      >
        <Container className="flex flex-col py-2">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-hairline/50 py-3 font-mono text-sm text-ink last:border-b-0"
            >
              <span className="mr-2 text-accent/70">{l.index}.</span>
              {l.label}
            </Link>
          ))}
        </Container>
      </div>
    </header>
  );
}
