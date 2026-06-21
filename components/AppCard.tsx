import Link from "next/link";
import Image from "next/image";
import type { App } from "@/data/apps";
import PlaceholderImage from "./PlaceholderImage";
import StatusTag from "./StatusTag";

/**
 * AppCard — one cell in the App Grid (PRD §5.3): image, name, one-liner,
 * status tag. App Store-inspired, not a clone. Links to the detail page.
 */
export default function AppCard({ app }: { app: App }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-hairline bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(27,26,24,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-hairline">
        {app.heroImage.real ? (
          <Image
            src={app.heroImage.src}
            alt={app.heroImage.alt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
            className="object-cover object-top"
          />
        ) : (
          <PlaceholderImage label={`${app.name} hero`} src={app.heroImage.src} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            {app.name}
          </h3>
          <StatusTag status={app.statusTag} />
        </div>
        <p className="text-sm leading-relaxed text-muted">{app.oneLiner}</p>
        <span className="mt-auto pt-2 text-sm font-medium text-accent">
          View
          <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
