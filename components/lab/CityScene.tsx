"use client";

// EXPERIMENT 02 — THE STRIP
// A night city built one app at a time. Scroll = walking: the canvas street
// rolls past underneath while each district's card holds sticky beside its
// building. The street ends at an unbuilt lot and the gaze lifts to the sky —
// the contact beat. DOM carries all copy (readable, accessible); the canvas
// carries the world.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { labApps, operator, scrub, statusColor, type LabApp } from "@/lib/lab/content";
import { StripEngine } from "@/lib/lab/cityEngine";
import AppDossier from "@/components/lab/AppDossier";

export default function CityScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoneRefs = useRef<Array<HTMLElement | null>>([]);
  const outroRef = useRef<HTMLElement | null>(null);
  const engineRef = useRef<StripEngine | null>(null);
  const rafRef = useRef(0);
  const [dossier, setDossier] = useState<LabApp | null>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new StripEngine(
      canvas,
      labApps.map((l) => ({ slug: l.id.slug, name: l.app.name, accent: l.id.accent }))
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
        // which district is the walker in?
        const probe = window.scrollY + window.innerHeight * 0.45;
        let idx = -1;
        zoneRefs.current.forEach((el, i) => {
          if (el && probe >= el.offsetTop && probe < el.offsetTop + el.offsetHeight) idx = i;
        });
        setActive(idx);
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

  const jumpTo = useCallback((i: number) => {
    const el = zoneRefs.current[i];
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.1, behavior: "smooth" });
  }, []);

  return (
    <div className="city">
      <canvas ref={canvasRef} className="city-canvas" aria-hidden />

      <div className="city-flow">
        {/* street entrance */}
        <section className="city-intro">
          <p className="lab-eyebrow">experiment 02 · ankit anand</p>
          <h1>THE STRIP</h1>
          <p className="city-sub">
            Nobody sold me a seat in this city, so I built my own block.
            Six buildings so far — every one of them started as a personal itch.
          </p>
          <span className="city-scroll-cue">scroll to walk</span>
        </section>

        {/* six districts */}
        {labApps.map((entry, i) => {
          const { app, id } = entry;
          return (
            <section
              key={id.slug}
              ref={(el) => {
                zoneRefs.current[i] = el;
              }}
              className={`city-zone${i % 2 === 1 ? " right" : ""}`}
              style={{ "--zone-accent": id.accent } as CSSProperties}
            >
              <div className="city-card">
                <span className="cnum">
                  DISTRICT {String(i + 1).padStart(2, "0")} / 06
                </span>
                <h2>
                  {app.name}
                  <span className="cflavor">{id.flavor}</span>
                </h2>
                <p className="cline">{scrub(app.oneLiner)}</p>
                <div className="pill-row" style={{ marginBottom: 14 }}>
                  <span className="pill" style={{ color: statusColor[app.statusTag] }}>
                    <span className="chip-dot" aria-hidden />
                    {app.statusTag}
                  </span>
                </div>
                <button className="lab-btn city-enter" onClick={() => setDossier(entry)}>
                  step inside →
                </button>
              </div>
            </section>
          );
        })}

        {/* the unbuilt lot */}
        <section
          className="city-outro"
          ref={(el) => {
            outroRef.current = el;
          }}
        >
          <p className="lab-eyebrow">the end of the street · for now</p>
          <h2>The next building isn&rsquo;t built yet.</h2>
          <p>
            {operator.line} Every block here began as a tool for one person —
            the interesting question is what goes on the empty lot. If you want
            to be part of that conversation, the door&rsquo;s open.
          </p>
          <div className="cta-row">
            <a className="lab-btn primary" href={`mailto:${operator.contact.email}`}>
              get in touch
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
        </section>
      </div>

      {/* chrome */}
      <header className="lab-hud">
        <Link href="/lab" className="lab-btn">
          ← the lab
        </Link>
        <span className="lab-hud-title">experiment 02 · the strip</span>
        <span />
      </header>

      <nav className="city-dots" aria-label="Districts">
        {labApps.map((l, i) => (
          <button
            key={l.id.slug}
            className={active === i ? "on" : ""}
            style={{ "--dot-c": l.id.accent } as CSSProperties}
            onClick={() => jumpTo(i)}
            aria-label={`Walk to ${l.app.name}`}
          />
        ))}
      </nav>

      {dossier && <AppDossier entry={dossier} onClose={() => setDossier(null)} />}
    </div>
  );
}
