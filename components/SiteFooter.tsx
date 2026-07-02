import { site } from "@/data/site";
import Container from "./Container";

/** Quiet mono footer. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-hairline py-10">
      <Container className="flex flex-col items-center justify-between gap-4 font-mono text-xs text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="text-muted/70">
          PLACEHOLDER — designed &amp; built with AI · shipped from the terminal
        </p>
      </Container>
    </footer>
  );
}
