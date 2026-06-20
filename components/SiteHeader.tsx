import Link from "next/link";
import { site } from "@/data/site";
import Container from "./Container";

/** Minimal sticky header — name as home link + anchor nav. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline/60 bg-paper/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-ink"
        >
          {site.name}
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/#arc" className="transition-colors hover:text-ink">
            The arc
          </Link>
          <Link href="/#apps" className="transition-colors hover:text-ink">
            Apps
          </Link>
          <Link href="/#build" className="transition-colors hover:text-ink">
            How I build
          </Link>
          <Link
            href="/#contact"
            className="rounded-full bg-ink px-4 py-1.5 font-medium text-paper transition-opacity hover:opacity-90"
          >
            Get in touch
          </Link>
        </nav>
      </Container>
    </header>
  );
}
