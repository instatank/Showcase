import Link from "next/link";
import type { App } from "@/data/apps";
import PlaceholderImage from "./PlaceholderImage";
import StatusTag from "./StatusTag";

/**
 * AppCard — one cell in the builds grid: image, name, one-liner, status tag.
 * Links to the detail page. Hover lifts the card and warms the border.
 */
export default function AppCard({ app }: { app: App }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-hairline bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent-edge hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline">
        <PlaceholderImage label={`${app.name} hero`} src={app.heroImage.src} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {app.name}
          </h3>
          <StatusTag status={app.statusTag} />
        </div>
        <p className="text-sm leading-relaxed text-muted">{app.oneLiner}</p>
        <span className="mt-auto pt-2 font-mono text-xs font-medium uppercase tracking-wider text-accent">
          View build
          <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
