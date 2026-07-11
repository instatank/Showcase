"use client";

// EXPERIMENT 04 — THE GARDEN
// A Japanese temple garden at dusk. Scroll is walking (The Strip's legs),
// but the path winds and the camera turns with the stones, and each station
// is a different kind of place that opens up when reached (The Orbit's
// chambers): a stone lantern, a hanami tree, a koi pond, a shishi-odoshi,
// a tea house on the lake, a zen garden. The path ends at a temple; contact
// is ringing the bell. One world, two skins — a painterly-cinematic dusk
// and a cel-shaded anime evening — swappable live from the HUD.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { labApps, operator, scrub, statusColor, type LabApp } from "@/lib/lab/content";
import { GardenEngine, type GardenStyle, type StationKind } from "@/lib/lab/gardenEngine";
import AppDossier from "@/components/lab/AppDossier";

// each app is a different kind of place — variety is the point of a garden
const STATION_META: Record<
  string,
  { kind: StationKind; place: string; line: string }
> = {
  dayos: {
    kind: "lantern",
    place: "the stone lantern",
    line: "Lit at dusk, out at dawn — the light that runs the day.",
  },
  partyspark: {
    kind: "sakura",
    place: "the hanami tree",
    line: "Under a tree in full bloom, strangers become a party.",
  },
  billbud: {
    kind: "koi",
    place: "the koi pond",
    line: "Every koi in this pond is counted, named, and fed on time.",
  },
  cadence: {
    kind: "shishi",
    place: "the shishi-odoshi",
    line: "The bamboo fills, tips, and clacks — training is a rhythm kept.",
  },
  mymealmap: {
    kind: "teahouse",
    place: "the tea house",
    line: "Nourishment, planned like a ceremony and served like one.",
  },
  tradegenie: {
    kind: "zen",
    place: "the zen garden",
    line: "Raked lines you learn to read — every pattern on the record.",
  },
};

export default function GardenScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoneRefs = useRef<Array<HTMLElement | null>>([]);
  const outroRef = useRef<HTMLElement | null>(null);
  const engineRef = useRef<GardenEngine | null>(null);
  const rafRef = useRef(0);
  const [dossier, setDossier] = useState<LabApp | null>(null);
  const [active, setActive] = useState(-1);
  const [style, setStyle] = useState<GardenStyle>("real");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GardenEngine(
      canvas,
      labApps.map((l) => ({
        slug: l.id.slug,
        name: l.app.name,
        accent: l.id.accent,
        kind: STATION_META[l.id.slug].kind,
      }))
    );
    engine.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    engineRef.current = engine;

    const denom = () =>
      Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const measure = () => {
      const d = denom();
      const fractions = zoneRefs.current.map((el) => {
        if (!el) return 0.5;
        const center = el.offsetTop + el.offsetHeight * 0.42 - window.innerHeight / 2;
        return Math.min(1, Math.max(0, center / d));
      });
      const outroEl = outroRef.current;
      const outroStart = outroEl
        ? Math.min(0.97, Math.max(0.5, (outroEl.offsetTop - window.innerHeight) / d))
        : 0.86;
      engine.layout(fractions, outroStart);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        engine.setProgress(window.scrollY / denom());
        const probe = window.scrollY + window.innerHeight * 0.45;
        let idx = -1;
        zoneRefs.current.forEach((el, i) => {
          if (el && probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight) idx = i;
        });
        setActive(idx);
        engine.setActiveStation(idx);
      });
    };
    const onResize = () => {
      engine.resize();
      measure();
      onScroll();
    };

    measure();
    engine.setProgress(window.scrollY / denom());
    engine.start();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const toggleStyle = useCallback(() => {
    setStyle((prev) => {
      const next: GardenStyle = prev === "real" ? "anime" : "real";
      engineRef.current?.setStyle(next);
      return next;
    });
  }, []);

  const jumpTo = useCallback((i: number) => {
    const el = zoneRefs.current[i];
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.1, behavior: "smooth" });
  }, []);

  return (
    <div className={`garden${style === "anime" ? " anime" : ""}`}>
      <canvas ref={canvasRef} className="garden-canvas" aria-hidden />

      <div className="city-flow">
        {/* the threshold — you enter through the torii */}
        <section className="garden-intro">
          <p className="lab-eyebrow">experiment 04 · ankit anand</p>
          <h1>The Garden</h1>
          <p className="garden-sub">
            Six things I built, planted where they can grow. The gate is open —
            walk the stones, and let each place open up to you.
          </p>
          <span className="city-scroll-cue">scroll to walk</span>
        </section>

        {/* six stations */}
        {labApps.map((entry, i) => {
          const { app, id } = entry;
          const meta = STATION_META[id.slug];
          return (
            <section
              key={id.slug}
              ref={(el) => {
                zoneRefs.current[i] = el;
              }}
              className={`city-zone garden-zone${i % 2 === 0 ? " right" : ""}`}
              style={{ "--zone-accent": id.accent } as CSSProperties}
            >
              <div className="gz-card">
                <span className="gz-seal" aria-hidden>
                  {id.glyph}
                </span>
                <span className="cnum">
                  STATION {String(i + 1).padStart(2, "0")} / 06 · {meta.place}
                </span>
                <h2>{app.name}</h2>
                <p className="gz-line">{meta.line}</p>
                <p className="gz-fact">{scrub(app.oneLiner)}</p>
                <div className="pill-row" style={{ marginBottom: 14 }}>
                  <span className="pill gz-pill" style={{ color: statusColor[app.statusTag] }}>
                    <span className="chip-dot" aria-hidden />
                    {app.statusTag}
                  </span>
                </div>
                <button className="lab-btn gz-enter" onClick={() => setDossier(entry)}>
                  step off the path →
                </button>
              </div>
            </section>
          );
        })}

        {/* the temple */}
        <section
          className="garden-outro"
          ref={(el) => {
            outroRef.current = el;
          }}
        >
          {/* sticky: the words wait at eye level instead of riding into the HUD */}
          <div className="outro-inner">
            <p className="lab-eyebrow">the temple · end of the path</p>
            <h2>A garden is tended, never finished.</h2>
            <p>
              {operator.line} The next stone isn&rsquo;t laid yet — if you want a
              say in where it goes, ring the bell.
            </p>
            <div className="cta-row">
              <a className="lab-btn gz-bell" href={`mailto:${operator.contact.email}`}>
                ⌾ ring the bell
              </a>
              <a className="lab-btn" href={operator.contact.x.url} target="_blank" rel="noreferrer">
                {scrub(operator.contact.x.handle)} on X
              </a>
              <a
                className="lab-btn"
                href={operator.contact.linkedin.url}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* chrome */}
      <header className="lab-hud">
        <Link href="/lab" className="lab-btn">
          ← the lab
        </Link>
        <span className="lab-hud-title">experiment 04 · the garden</span>
        <button
          className="lab-btn"
          onClick={toggleStyle}
          title="repaint the same garden in the other style"
        >
          {style === "real" ? "◑ see it as anime" : "◑ see it painterly"}
        </button>
      </header>

      <nav className="city-dots garden-dots" aria-label="Stations">
        {labApps.map((l, i) => (
          <button
            key={l.id.slug}
            className={active === i ? "on" : ""}
            style={{ "--dot-c": l.id.accent } as CSSProperties}
            onClick={() => jumpTo(i)}
            aria-label={`Walk to ${l.app.name} — ${STATION_META[l.id.slug].place}`}
          />
        ))}
      </nav>

      {dossier && <AppDossier entry={dossier} onClose={() => setDossier(null)} />}
    </div>
  );
}
