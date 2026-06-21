import Link from "next/link";
import type { App } from "@/data/apps";
import Container from "./Container";
import Reveal from "./Reveal";
import Visual from "./Visual";
import StatusTag from "./StatusTag";

/**
 * AppDetail — the ONE shared template every app detail page renders through
 * (PRD §6). All six apps are structurally identical: same six fields, same
 * order, driven only by data. Renders every field + the full visual set.
 */
export default function AppDetail({ app }: { app: App }) {
  return (
    <article className="py-12 sm:py-16">
      <Container>
        {/* back link */}
        <Link
          href="/#apps"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> All apps
        </Link>

        {/* header: name + one-liner + status */}
        <Reveal>
          <header className="mt-8 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
                {app.name}
              </h1>
              <StatusTag status={app.statusTag} />
            </div>
            <p className="mt-4 text-lg leading-relaxed text-muted sm:text-xl">
              {app.oneLiner}
            </p>
            {/* Experience mode: live-demo gets a button; screenshots-only gets a quiet note. */}
            {app.experienceMode === "live-demo" && app.liveUrl ? (
              <a
                href={app.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Open live demo <span aria-hidden>→</span>
              </a>
            ) : (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
                Screenshots only
              </p>
            )}
          </header>
        </Reveal>

        {/* hero shot in the device frame */}
        <Reveal delay={100}>
          <div className="mt-10 grid items-center gap-8 rounded-xl2 border border-hairline bg-surface p-5 sm:gap-10 sm:p-12 lg:grid-cols-2">
            <Visual visual={app.heroImage} />
            <div className="space-y-8">
              {/* The itch */}
              <Field label="The itch">
                <p>{app.theItch}</p>
              </Field>
              {/* What it does — exactly 3 bullets */}
              <Field label="What it does">
                <ul className="space-y-2">
                  {app.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Field>
            </div>
          </div>
        </Reveal>

        {/* How it was built */}
        <Reveal>
          <section className="mt-12 max-w-3xl">
            <Field label="How it was built">
              {app.howItWasBuilt.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-4" : undefined}>
                  {para}
                </p>
              ))}
            </Field>
          </section>
        </Reveal>

        {/* Visual set: supporting shots + optional clip */}
        <Reveal>
          <section className="mt-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Visual set
            </h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {app.supportingImages.map((visual) => (
                <Visual key={visual.src} visual={visual} />
              ))}
            </div>

            {app.clipUrl && (
              <div className="mt-12">
                <div className="flex aspect-video w-full max-w-3xl items-center justify-center rounded-xl2 border border-hairline bg-stone-100 text-center">
                  <div className="flex flex-col items-center gap-2 p-6">
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                      Placeholder clip
                    </span>
                    <span className="text-sm font-medium text-ink/70">
                      15–20s screen-recording
                    </span>
                    <code className="text-[11px] text-muted/80">
                      {app.clipUrl}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </section>
        </Reveal>
      </Container>
    </article>
  );
}

/** A single labelled field in the detail template. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
        {label}
      </h2>
      <div className="mt-3 text-lg leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}
