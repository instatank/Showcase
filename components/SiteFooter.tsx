import { site } from "@/data/site";
import Container from "./Container";

/** Quiet footer. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="text-xs uppercase tracking-wider text-muted/70">
          PLACEHOLDER — built with Next.js · scaffold v1
        </p>
      </Container>
    </footer>
  );
}
