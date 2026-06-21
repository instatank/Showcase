import Link from "next/link";
import { apps } from "@/data/apps";
import { site } from "@/data/site";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import AppCard from "@/components/AppCard";
import PlaceholderImage from "@/components/PlaceholderImage";

export default function HomePage() {
  return (
    <>
      {/* 1 — HERO (PRD §5.1): name, photo, one-line positioning, the hook */}
      <section className="relative overflow-hidden">
        <Container className="grid items-center gap-10 py-14 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="order-2 lg:order-1">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent sm:mb-5 sm:text-sm">
              PLACEHOLDER — AI Builder
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/80 sm:mt-6 sm:text-xl">
              {site.positioning}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:mt-4 sm:text-lg">
              {site.hook}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
              <Link
                href="#apps"
                className="rounded-full bg-ink px-6 py-3 text-center text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                See the apps
              </Link>
              <Link
                href="#contact"
                className="rounded-full border border-hairline px-6 py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                Get in touch
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="mx-auto aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-xl2 border border-hairline bg-surface shadow-sm sm:max-w-xs">
              <PlaceholderImage
                label={site.heroPhoto.alt}
                src={site.heroPhoto.src}
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 2 — THE ARC (PRD §5.2): poker → AI operator */}
      <section id="arc" className="border-t border-hairline bg-surface py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="The arc" title="Poker → AI operator." />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {site.arc.map((para, i) => (
              <Reveal key={i} delay={i * 100}>
                <p className="text-lg leading-relaxed text-ink/80">{para}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 3 — APP GRID (PRD §5.3): six cards */}
      <section id="apps" className="py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="The work" title="Six apps. Built and shipped.">
              The evidence. Each one started as a tool built for a real personal
              itch.
            </SectionHeading>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app, i) => (
              <Reveal key={app.slug} delay={(i % 3) * 80}>
                {/* Column position drives which way the hover preview expands
                    (left col → right, right col → left, middle → centred). */}
                <AppCard
                  app={app}
                  align={
                    i % 3 === 0 ? "left" : i % 3 === 2 ? "right" : "center"
                  }
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 4 — HOW I BUILD (PRD §5.5): the meta-skill */}
      <section id="build" className="border-t border-hairline bg-surface py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="How I build" title="The meta-skill.">
              {site.howIBuild.intro}
            </SectionHeading>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {site.howIBuild.points.map((point, i) => (
              <Reveal key={point.title} delay={i * 100}>
                <div className="rounded-xl2 border border-hairline bg-paper p-6">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted">
                    {point.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 5 — CONTACT (PRD §5.6 / §10): one low-pressure action */}
      <section id="contact" className="py-16 sm:py-28">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionHeading eyebrow="Contact" title="Get in touch.">
                {site.contact.blurb}
              </SectionHeading>
              <div className="mt-10 flex flex-col items-center gap-5">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="rounded-full bg-ink px-8 py-3.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
                >
                  Email me
                </a>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
                  <a
                    href={site.contact.x.url}
                    className="transition-colors hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {site.contact.x.handle} (X)
                  </a>
                  <a
                    href={site.contact.linkedin.url}
                    className="transition-colors hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {site.contact.linkedin.label}
                  </a>
                  {site.contact.calcom && (
                    <a
                      href={site.contact.calcom.url}
                      className="transition-colors hover:text-ink"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {site.contact.calcom.label}
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted/70">{site.contact.email}</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
