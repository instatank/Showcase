import Link from "next/link";
import { apps } from "@/data/apps";
import { site } from "@/data/site";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import AppCard from "@/components/AppCard";
import FeaturedAppCard from "@/components/FeaturedAppCard";
import PlaceholderImage from "@/components/PlaceholderImage";
import Glyph from "@/components/Glyph";

/**
 * Home — the whole story in one scroll, ordered for a 10-second glance:
 *
 *   HERO      who this is + the concrete claim + one action
 *   PROOF     stats strip (the numbers that make the claim credible)
 *   01 JOURNEY  poker → AI operator, as a ship-log timeline
 *   02 BUILDS   featured app + supporting grid (the evidence)
 *   03 PROCESS  how the shipping actually happens (the meta-skill)
 *   04 NOW      what's currently in motion (always learning)
 *   05 BEYOND   the person behind the terminal (personality, contained)
 *   06 CONTACT  one low-pressure action
 */
export default function HomePage() {
  const [featured, ...rest] = apps;

  return (
    <>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden">
        {/* faint blueprint grid, fading out downward */}
        <div aria-hidden className="bg-grid fade-mask-b absolute inset-0" />
        <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:py-28">
          <Reveal>
            {/* status badge — signals "live, in motion" immediately */}
            <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/80 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
              {site.operator.status}
            </p>

            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl">
              {site.name.split(" ")[0]}{" "}
              <span className="text-gradient-ember">
                {site.name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-xl leading-relaxed text-ink/85 sm:text-2xl">
              {site.positioning}
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {site.hook}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#builds"
                className="rounded-full bg-accent px-7 py-3 text-center text-sm font-semibold text-paper transition-all hover:bg-accent-bright hover:shadow-accent-glow"
              >
                See the builds ↓
              </Link>
              <Link
                href="#journey"
                className="rounded-full border border-hairline px-7 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-accent-edge hover:bg-white/5"
              >
                Read the story
              </Link>
            </div>
          </Reveal>

          {/* operator card — photo + quick mono facts, framed like an ID badge */}
          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-[19rem]">
              {/* corner brackets */}
              <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-accent/60" />
              <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 border-r-2 border-t-2 border-accent/60" />
              <span aria-hidden className="absolute -bottom-3 -left-3 h-6 w-6 border-b-2 border-l-2 border-accent/60" />
              <span aria-hidden className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-accent/60" />

              <div className="overflow-hidden rounded-xl2 border border-hairline bg-surface">
                <div className="aspect-[4/4.5] border-b border-hairline">
                  <PlaceholderImage
                    label={site.heroPhoto.alt}
                    src={site.heroPhoto.src}
                  />
                </div>
                <dl className="space-y-2.5 p-5 font-mono text-xs">
                  {[
                    ["location", site.operator.location],
                    ["origin", site.operator.origin],
                    ["focus", site.operator.focus],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <dt className="w-16 flex-none uppercase tracking-wider text-muted/70">
                        {k}
                      </dt>
                      <dd className="text-ink/80">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </Container>

        {/* PROOF — stats strip pinned to the bottom of the hero */}
        <div className="relative border-y border-hairline bg-surface/60 backdrop-blur-sm">
          <Container>
            <Reveal>
              <dl className="grid grid-cols-2 divide-hairline sm:grid-cols-4 sm:divide-x">
                {site.stats.map((stat) => (
                  <div key={stat.label} className="px-2 py-6 text-center sm:py-8">
                    <dd className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                      {stat.value}
                    </dd>
                    <dt className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        </div>
      </section>

      {/* ─────────────────────── 01 JOURNEY ─────────────────────── */}
      <section id="journey" className="scroll-mt-16 py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading index="01" eyebrow="the journey" title="Poker pro → AI operator.">
              {site.journeyIntro}
            </SectionHeading>
          </Reveal>

          {/* ship-log timeline */}
          <div className="relative mt-14 max-w-3xl">
            <span
              aria-hidden
              className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-accent/50 via-hairline to-transparent"
            />
            <ol className="space-y-12">
              {site.journey.map((entry, i) => (
                <Reveal key={entry.title} delay={i * 80}>
                  <li className="relative pl-10">
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 flex h-[15px] w-[15px] items-center justify-center rounded-full border border-accent/60 bg-paper"
                    >
                      <span className="h-[5px] w-[5px] rounded-full bg-accent" />
                    </span>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                      {entry.period}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                      {entry.title}
                    </h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-muted">
                      {entry.body}
                    </p>
                    <p className="mt-3 font-mono text-sm text-ink/70">
                      <span className="text-accent">↳ learned:</span>{" "}
                      {entry.learned}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── 02 BUILDS ─────────────────────── */}
      <section id="builds" className="scroll-mt-16 border-t border-hairline py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading index="02" eyebrow="the builds" title="Six apps. Built and shipped.">
              The evidence. Each one started as a tool built for a real
              personal itch.
            </SectionHeading>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-12">
              <FeaturedAppCard app={featured} />
            </div>
          </Reveal>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((app, i) => (
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
            {/* ghost slot — the shelf is never full */}
            <Reveal delay={(rest.length % 3) * 80}>
              <Link
                href="#now"
                className="group flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-hairline p-8 text-center transition-colors hover:border-accent-edge"
              >
                <span className="font-mono text-2xl text-muted transition-colors group-hover:text-accent">
                  +
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  next build brewing
                </span>
                <span className="text-sm text-muted/70">
                  PLACEHOLDER — see what&apos;s on the bench right now
                </span>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ─────────────────────── 03 PROCESS ─────────────────────── */}
      <section id="process" className="scroll-mt-16 border-t border-hairline bg-surface/40 py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading index="03" eyebrow="the process" title="How the shipping happens.">
              {site.howIBuild.intro}
            </SectionHeading>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {site.howIBuild.points.map((point, i) => (
              <Reveal key={point.title} delay={i * 100}>
                <div className="flex h-full flex-col rounded-xl2 border border-hairline bg-surface p-6 transition-colors hover:border-accent-edge">
                  <p className="font-mono text-xs text-muted">
                    <span className="text-accent">$</span> step_{i + 1} —{" "}
                    {point.command}
                  </p>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {point.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* default stack chips */}
          <Reveal delay={150}>
            <div className="mt-10 flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                default stack:
              </span>
              {site.howIBuild.stack.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-hairline bg-paper px-3.5 py-1.5 font-mono text-xs text-ink/75"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ───────────────────────── 04 NOW ───────────────────────── */}
      <section id="now" className="scroll-mt-16 border-t border-hairline py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading index="04" eyebrow="right now" title="Always in motion.">
              PLACEHOLDER — What&apos;s on the bench this quarter. The site is
              a snapshot; this section is the live feed.
            </SectionHeading>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {site.now.map((item, i) => (
              <Reveal key={item.label} delay={i * 100}>
                <div className="rounded-xl2 border border-hairline bg-surface p-6">
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
                    {item.label}
                  </p>
                  <p className="mt-3 leading-relaxed text-ink/80">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────── 05 BEYOND ─────────────────────── */}
      <section id="beyond" className="scroll-mt-16 border-t border-hairline bg-surface/40 py-16 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading index="05" eyebrow="beyond the build" title="The person behind the terminal.">
              PLACEHOLDER — The practices that keep the work honest: stillness,
              discipline, curiosity, and a taste for calculated risk.
            </SectionHeading>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.beyond.map((facet, i) => (
              <Reveal key={facet.glyph} delay={i * 80}>
                <div className="group h-full rounded-xl2 border border-hairline bg-surface p-6 transition-colors hover:border-accent-edge">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-paper text-muted transition-colors group-hover:border-accent-edge group-hover:text-accent">
                    <Glyph name={facet.glyph} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-ink">
                    {facet.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {facet.line}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─────────────────────── 06 CONTACT ─────────────────────── */}
      <section id="contact" className="relative scroll-mt-16 overflow-hidden border-t border-hairline py-20 sm:py-32">
        {/* single restrained glow behind the CTA */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
        />
        <Container className="relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <SectionHeading
                index="06"
                eyebrow="contact"
                title="Let's build something."
                align="center"
              >
                {site.contact.blurb}
              </SectionHeading>
              <div className="mt-10 flex flex-col items-center gap-5">
                <a
                  href={`mailto:${site.contact.email}`}
                  className="rounded-full bg-accent px-9 py-3.5 text-sm font-semibold text-paper transition-all hover:bg-accent-bright hover:shadow-accent-glow"
                >
                  Email me
                </a>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-sm text-muted">
                  <a
                    href={site.contact.x.url}
                    className="transition-colors hover:text-ink"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {site.contact.x.handle}
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
                <p className="font-mono text-xs text-muted/60">
                  {site.contact.email}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
