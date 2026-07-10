"use client";

// EXPERIMENT 01 — THE DEAL
// A noir card room. The arc arrives as a dealer's monologue, the six apps
// are dealt as a hand (AA's hand — pocket aces), each card flips to a face
// and opens its dossier, and contact is the river: the card that decides
// the hand. Pure DOM/CSS-3D — the immersion is tabletop-scale and tactile.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { labApps, operator, scrub, statusColor, type LabApp } from "@/lib/lab/content";
import AppDossier from "@/components/lab/AppDossier";

const MONOLOGUE: Array<React.ReactNode> = [
  <>For years I made a living reading <em>incomplete information</em>.</>,
  <>Poker teaches three things: risk, patience, and how it feels to be wrong.</>,
  <>Then AI made building things the next game worth learning.</>,
  <>No engineering background. Six shipped apps. <em>This is the hand.</em></>,
];

// fixed mote positions — client component still renders on the server,
// so anything random in render would tear at hydration
const MOTES = [
  [18, 22], [64, 16], [38, 34], [78, 40], [26, 55],
  [55, 48], [86, 62], [12, 70], [47, 74], [70, 26],
] as const;

function fanTransform(i: number): CSSProperties {
  const mid = (labApps.length - 1) / 2;
  const off = i - mid;
  return {
    "--tx": `${off * 118}px`,
    "--ty": `${Math.pow(Math.abs(off), 1.6) * 11}px`,
    "--rot": `${off * 7}deg`,
    "--deal-delay": `${0.35 + i * 0.22}s`,
  } as CSSProperties;
}

export default function DealScene() {
  const [seated, setSeated] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [dossier, setDossier] = useState<LabApp | null>(null);
  const [riverDealt, setRiverDealt] = useState(false);
  const [riverFlipped, setRiverFlipped] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  // the room leans with your gaze — parallax on the pointer, rAF-throttled
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { innerWidth: w, innerHeight: h } = window;
    const px = e.clientX / w - 0.5;
    const py = e.clientY / h - 0.5;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = tiltRef.current;
      if (el) el.style.transform = `rotateY(${px * 5}deg) rotateX(${py * -3.4}deg)`;
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const flipCard = (entry: LabApp) => {
    if (!flipped.has(entry.id.slug)) {
      setFlipped((prev) => new Set(prev).add(entry.id.slug));
    } else {
      setDossier(entry);
    }
  };

  const hint = useMemo(() => {
    if (!seated) return null;
    if (flipped.size === 0) return "the cards are face down — turn one over";
    if (flipped.size < 3) return "a flipped card opens its dossier on the second touch";
    if (!riverDealt) return "you've seen enough of the hand — the river is ready";
    if (!riverFlipped) return "one card left. turn it.";
    return null;
  }, [seated, flipped, riverDealt, riverFlipped]);

  // back to the monologue; cards unmount, so the next seat-down re-deals
  const redeal = () => {
    setFlipped(new Set());
    setRiverDealt(false);
    setRiverFlipped(false);
    setDossier(null);
    setSeated(false);
  };

  return (
    <div className="deal" onPointerMove={onPointerMove}>
      {/* the room — the table lives in the tilted 3D context; the cards sit
          in a flat overlay above it (a card plane intersecting the rotated
          felt plane gets sliced by it — real 3D is unforgiving) */}
      <div className="deal-stage" aria-hidden={!seated}>
        <div className="deal-tilt" ref={tiltRef}>
          <div className="deal-table">
            <span className="deal-felt-text">SIX APPS · ONE HAND</span>
            <span className="deal-felt-sub">ankit anand · est. the hard way</span>
          </div>
        </div>

        <div className="deal-card-layer">
          {seated && (
            <div className="deal-cards">
              {labApps.map((entry, i) => {
                const { app, id } = entry;
                const isFlipped = flipped.has(id.slug);
                return (
                  <button
                    key={id.slug}
                    className={`dcard${isFlipped ? " flipped" : ""}`}
                    style={{
                      ...fanTransform(i),
                      "--card-accent": id.accent,
                      "--chip": statusColor[app.statusTag],
                      zIndex: 5 + i,
                    } as CSSProperties}
                    onClick={() => flipCard(entry)}
                    aria-label={
                      isFlipped
                        ? `${app.name} — open dossier`
                        : `Face-down card ${i + 1} of 6 — flip`
                    }
                  >
                    <span className="dcard-inner">
                      <span className="dcard-back">
                        <span className="mono">
                          {operator.monogram}
                          <small>the operator</small>
                        </span>
                      </span>
                      <span className="dcard-face">
                        <span className={`corner tl${id.suitRed ? " red" : ""}`}>
                          {id.rank}
                          <span className="suit">{id.suit}</span>
                        </span>
                        <span className={`corner br${id.suitRed ? " red" : ""}`}>
                          {id.rank}
                          <span className="suit">{id.suit}</span>
                        </span>
                        <span className="fglyph" aria-hidden>
                          {id.glyph}
                        </span>
                        <span className="fname">{app.name}</span>
                        <span className="fline">{scrub(app.oneLiner)}</span>
                        <span className="fopen">open the dossier</span>
                        <span className="fstatus">
                          <span className="chip-dot" aria-hidden />
                          {app.statusTag}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}

              {riverDealt && (
                <div
                  className={`dcard river${riverFlipped ? " flipped" : ""}`}
                  role="button"
                  tabIndex={0}
                  style={{
                    "--tx": "0px",
                    "--ty": "150px",
                    "--rot": "0deg",
                    "--deal-delay": "0.1s",
                  } as CSSProperties}
                  onClick={() => setRiverFlipped(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setRiverFlipped(true);
                  }}
                  aria-label={riverFlipped ? "The river — contact" : "The river card — flip"}
                >
                  <span className="dcard-inner">
                    <span className="dcard-back">
                      <span className="mono">
                        ◈<small>the river</small>
                      </span>
                    </span>
                    <span className="dcard-face gold">
                      <span className="fglyph" aria-hidden>
                        ◈
                      </span>
                      <span className="fname">The next hand</span>
                      <span className="fline">
                        The cards on the table are played. The interesting ones
                        aren&rsquo;t dealt yet.
                      </span>
                      <span
                        className="fstatus"
                        style={{ flexDirection: "column", gap: 7 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a className="lab-btn" href={`mailto:${operator.contact.email}`}>
                          get in touch
                        </a>
                      </span>
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="deal-light" aria-hidden />
        {MOTES.map(([x, y], i) => (
          <span
            key={i}
            className="deal-mote"
            aria-hidden
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 1.7}s` }}
          />
        ))}
      </div>

      {/* the dealer's monologue */}
      <div className={`deal-mono${seated ? " leaving" : ""}`}>
        {MONOLOGUE.map((line, i) => (
          <p key={i} className="dm-line" style={{ animationDelay: `${0.6 + i * 1.5}s` }}>
            {line}
          </p>
        ))}
        <button
          className="lab-btn dm-sit"
          style={{ animationDelay: `${0.6 + MONOLOGUE.length * 1.5}s` }}
          onClick={() => setSeated(true)}
        >
          take a seat →
        </button>
      </div>

      {/* chrome */}
      <header className="lab-hud">
        <Link href="/lab" className="lab-btn">
          ← the lab
        </Link>
        <span className="lab-hud-title">experiment 01 · the deal</span>
        <button className="lab-btn" onClick={redeal}>
          re-deal ↺
        </button>
      </header>

      <div className={`lab-hint${hint && !dossier ? "" : " off"}`} aria-live="polite">
        {hint ?? ""}
      </div>

      {seated && (
        <div className="deal-progress" aria-label={`${flipped.size} of 6 cards seen`}>
          {labApps.map((l) => (
            <span key={l.id.slug} className={`pg${flipped.has(l.id.slug) ? " on" : ""}`} />
          ))}
        </div>
      )}

      {seated && flipped.size >= 3 && !riverDealt && (
        <button className="lab-btn deal-river-cta" onClick={() => setRiverDealt(true)}>
          deal the river ◈
        </button>
      )}

      {dossier && <AppDossier entry={dossier} onClose={() => setDossier(null)} />}
    </div>
  );
}
