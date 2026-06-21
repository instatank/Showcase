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
  // For apps with real screenshots, preview 3 of them as mini phones in the
  // card; the click-through goes to the full detail page anyway.
  const gallery = app.heroImage.real
    ? [app.heroImage, ...app.supportingImages].slice(0, 3)
    : null;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group relative z-0 flex flex-col rounded-xl2 border border-hairline bg-surface transition-all duration-300 hover:z-30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(27,26,24,0.35)] focus:outline-none focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="group/shots relative aspect-[4/3] border-b border-hairline">
        {gallery ? (
          <>
            {/* Resting state: a row of mini phones. Fades + shrinks on hover. */}
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 overflow-hidden rounded-t-xl2 bg-gradient-to-br from-stone-50 to-stone-100 p-4 transition-all duration-300 ease-out group-hover/shots:scale-95 group-hover/shots:opacity-0 group-focus-visible:scale-95 group-focus-visible:opacity-0 sm:gap-3">
              {gallery.map((visual) => (
                <div
                  key={visual.src}
                  className="relative h-[90%] overflow-hidden rounded-lg border border-hairline bg-surface shadow-md ring-1 ring-black/5"
                  style={{ aspectRatio: "9 / 19.5" }}
                >
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes="120px"
                    className="object-cover object-top"
                  />
                </div>
              ))}
            </div>
            {/* Hover state: the three shots zoom up into an expanded preview that
                floats above the card. pointer-events-none so a click still
                navigates through to the detail page. */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center gap-3 rounded-2xl border border-hairline bg-white/80 p-4 opacity-0 shadow-[0_40px_80px_-24px_rgba(27,26,24,0.5)] backdrop-blur-md transition-all duration-300 ease-out group-hover/shots:scale-100 group-hover/shots:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              style={{ width: "min(82vw, 460px)" }}
              aria-hidden
            >
              {gallery.map((visual) => (
                <div
                  key={visual.src}
                  className="relative aspect-[9/19.5] w-1/3 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg ring-1 ring-black/5"
                >
                  <Image
                    src={visual.src}
                    alt={visual.alt}
                    fill
                    sizes="160px"
                    className="object-cover object-top"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 overflow-hidden rounded-t-xl2">
            <PlaceholderImage label={`${app.name} hero`} src={app.heroImage.src} />
          </div>
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
