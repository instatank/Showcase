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

  // Per-shot motion for the hover "fan": outer shots spread out + tilt, the
  // centre one lifts and scales up the most. Staggered so they cascade open.
  const fan = [
    "group-hover/shots:-translate-x-10 group-hover/shots:-rotate-[7deg] group-hover/shots:scale-100 group-focus-visible:-translate-x-10 group-focus-visible:-rotate-[7deg] group-focus-visible:scale-100",
    "z-10 group-hover/shots:-translate-y-5 group-hover/shots:scale-110 group-focus-visible:-translate-y-5 group-focus-visible:scale-110",
    "group-hover/shots:translate-x-10 group-hover/shots:rotate-[7deg] group-hover/shots:scale-100 group-focus-visible:translate-x-10 group-focus-visible:rotate-[7deg] group-focus-visible:scale-100",
  ];
  const fanDelay = ["delay-0", "delay-100", "delay-200"];

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
            {/* Hover state: the three shots fan out into a large expanded
                preview that floats above the rest of the page. pointer-events-none
                so a click still navigates through to the detail page. */}
            <div
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
              aria-hidden
            >
              <div
                className="flex shrink-0 translate-y-4 scale-95 items-center justify-center gap-5 rounded-3xl border border-white/60 bg-white/65 p-6 opacity-0 shadow-[0_60px_140px_-40px_rgba(27,26,24,0.7)] backdrop-blur-xl transition-all duration-500 ease-out group-hover/shots:translate-y-0 group-hover/shots:scale-100 group-hover/shots:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                style={{ width: "min(95vw, 880px)" }}
              >
                {/* soft accent glow behind the deck */}
                <div className="pointer-events-none absolute inset-6 -z-10 rounded-full bg-gradient-to-tr from-accent/15 via-transparent to-violet-400/15 blur-3xl" />
                {gallery.map((visual, i) => (
                  <div
                    key={visual.src}
                    className={`relative aspect-[9/19.5] w-1/3 scale-75 overflow-hidden rounded-2xl border border-hairline bg-surface opacity-0 shadow-2xl ring-1 ring-black/5 transition-all duration-500 ease-out group-hover/shots:opacity-100 group-focus-visible:opacity-100 ${fan[i]} ${fanDelay[i]}`}
                  >
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="280px"
                      className="object-cover object-top"
                    />
                  </div>
                ))}
              </div>
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
