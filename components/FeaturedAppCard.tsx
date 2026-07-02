import Link from "next/link";
import type { App } from "@/data/apps";
import DeviceFrame from "./DeviceFrame";
import PlaceholderImage from "./PlaceholderImage";
import StatusTag from "./StatusTag";

/**
 * FeaturedAppCard — the flagship slot at the top of the builds section.
 * One app gets the big treatment (device frame + itch + features) so the
 * grid below reads as supporting evidence, not an undifferentiated wall.
 */
export default function FeaturedAppCard({ app }: { app: App }) {
  return (
    <div className="relative overflow-hidden rounded-xl2 border border-hairline bg-surface">
      {/* soft ember wash behind the device */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Featured build
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h3 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {app.name}
            </h3>
            <StatusTag status={app.statusTag} />
          </div>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/80">
            {app.oneLiner}
          </p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
            {app.theItch}
          </p>
          <ul className="mt-6 space-y-2.5">
            {app.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm text-ink/75">
                <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/apps/${app.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-paper transition-all hover:bg-accent-bright hover:shadow-accent-glow"
          >
            View the full build
            <span aria-hidden>→</span>
          </Link>
        </div>
        <DeviceFrame className="max-w-[260px] lg:max-w-[280px]">
          <PlaceholderImage label={app.heroImage.alt} src={app.heroImage.src} />
        </DeviceFrame>
      </div>
    </div>
  );
}
