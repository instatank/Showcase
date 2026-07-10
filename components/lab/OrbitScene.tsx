"use client";

// EXPERIMENT 03 — THE ORBIT
// First-person flight through the builder's system. The operator's story is
// the sun; the six apps are worlds with their own procedural weather; the
// contact channel is a gold gate hanging below the plane. Gravity does the
// persuading: drift close to anything and it pulls you into orbit, and the
// chamber opens. Descended from UoT's Voyage — tuned for a showcase, so
// nothing is locked and every body is a tap away.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { labApps, operator, scrub, statusColor, labApp } from "@/lib/lab/content";
import { OrbitEngine, type OrbitTarget } from "@/lib/lab/orbitEngine";
import { worldKindBySlug } from "@/lib/lab/orbitPaint";
import { mulberry32, seedFrom } from "@/lib/lab/rand";
import AppDossier from "@/components/lab/AppDossier";

const CORE_POS: [number, number, number] = [0, 0, 320];
const GATE_POS: [number, number, number] = [0, -280, 620];
const GOLD = "#d8c98a";

function buildTargets(): OrbitTarget[] {
  const rng = mulberry32(seedFrom("orbit-layout"));
  const N = labApps.length;
  const worlds: OrbitTarget[] = labApps.map((entry, i) => {
    const ang = ((-90 + (360 / N) * i + (rng() - 0.5) * 22) * Math.PI) / 180;
    const rad = 300 + rng() * 70;
    const y = -70 + rng() * 150;
    return {
      id: entry.id.slug,
      kind: "world",
      pos: [
        CORE_POS[0] + Math.cos(ang) * rad,
        CORE_POS[1] + y,
        CORE_POS[2] + Math.sin(ang) * rad,
      ],
      r: 30,
      title: entry.app.name,
      subtitle: entry.id.flavor,
      color: entry.id.accent,
      worldKind: worldKindBySlug[entry.id.slug],
      visited: false,
    };
  });
  return [
    {
      id: "core",
      kind: "core",
      pos: CORE_POS,
      r: 36,
      title: operator.name,
      subtitle: "the operator — start here",
      color: "#e8dcb0",
      visited: false,
      cue: true,
    },
    ...worlds,
    {
      id: "gate",
      kind: "gate",
      pos: GATE_POS,
      r: 26,
      title: "Open a channel",
      subtitle: "the way out is a conversation",
      color: GOLD,
      visited: false,
    },
  ];
}

type Chamber = { kind: "core" } | { kind: "world"; slug: string } | { kind: "gate" };

export default function OrbitScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<OrbitEngine | null>(null);
  const [chamber, setChamber] = useState<Chamber | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [hint, setHint] = useState<string | null>(null);
  const [intro, setIntro] = useState(true);
  const hintTimer = useRef(0);
  const visitedRef = useRef(visited);
  visitedRef.current = visited;

  const say = useCallback((text: string | null, ms = 0) => {
    window.clearTimeout(hintTimer.current);
    setHint(text);
    if (text && ms > 0) hintTimer.current = window.setTimeout(() => setHint(null), ms);
  }, []);

  // engine lifecycle — once per mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new OrbitEngine(canvas, {
      onCapture: (id) => {
        say(null);
        setVisited((prev) => new Set(prev).add(id));
        if (id === "core") setChamber({ kind: "core" });
        else if (id === "gate") setChamber({ kind: "gate" });
        else setChamber({ kind: "world", slug: id });
      },
      onHint: (h) => say(h),
    });
    engine.reducedMotion = reduced;
    engineRef.current = engine;
    engine.start(buildTargets(), [0, 70, -280], CORE_POS);
    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);
    // test/dev hook — lets automation fly deterministically
    (window as unknown as Record<string, unknown>).__orbitTravel = (id: string) =>
      engine.travelTo(id);
    (window as unknown as Record<string, unknown>).__orbitEngine = engine;
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(hintTimer.current);
      delete (window as unknown as Record<string, unknown>).__orbitTravel;
      delete (window as unknown as Record<string, unknown>).__orbitEngine;
      engine.dispose();
      engineRef.current = null;
    };
  }, [say]);

  // arc → cue states: the sun first, then the gate once the worlds are seen
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const worldsSeen = labApps.filter((l) => visited.has(l.id.slug)).length;
    e.patchTarget("core", { visited: visited.has("core"), cue: !visited.has("core") });
    for (const l of labApps) e.patchTarget(l.id.slug, { visited: visited.has(l.id.slug) });
    e.patchTarget("gate", {
      visited: visited.has("gate"),
      cue: worldsSeen >= labApps.length && !visited.has("gate"),
      subtitle: worldsSeen >= 2 ? "the way out is a conversation — enter" : "the way out is a conversation",
    });
  }, [visited]);

  const releaseChamber = useCallback(() => {
    const was = chamber;
    setChamber(null);
    const e = engineRef.current;
    e?.release();
    const v = visitedRef.current;
    const worldsSeen = labApps.filter((l) => v.has(l.id.slug)).length;
    if (was?.kind === "core" && worldsSeen === 0) {
      say("six worlds circle the story — fly toward one, or let ◉ carry you");
    } else if (worldsSeen >= labApps.length && !v.has("gate")) {
      e?.orientToward(GATE_POS);
      say("every world visited — a golden channel hangs below the sun");
    } else if (was?.kind === "world" && worldsSeen < labApps.length) {
      say(`${worldsSeen} of ${labApps.length} worlds seen — the rest are out there`, 6000);
    }
  }, [chamber, say]);

  // first instruction once the intro lifts
  useEffect(() => {
    if (!intro) say("drag to look · tap the sun to begin — or let ◉ carry you onward");
  }, [intro, say]);

  const worldsSeen = useMemo(
    () => labApps.filter((l) => visited.has(l.id.slug)).length,
    [visited]
  );

  const chamberEntry = chamber?.kind === "world" ? labApp(chamber.slug) : undefined;

  return (
    <div className="orbit">
      <canvas ref={canvasRef} className="orbit-canvas" aria-hidden />

      {/* the same space, without a pointer */}
      <nav className="o-sr-nav" aria-label="Places in the system">
        <button onClick={() => engineRef.current?.travelTo("core")}>
          travel to the operator&rsquo;s sun
        </button>
        {labApps.map((l) => (
          <button key={l.id.slug} onClick={() => engineRef.current?.travelTo(l.id.slug)}>
            travel to {l.app.name}
          </button>
        ))}
        <button onClick={() => engineRef.current?.travelTo("gate")}>
          travel to the contact gate
        </button>
      </nav>

      <header className="lab-hud">
        <Link href="/lab" className="lab-btn">
          ← the lab
        </Link>
        <span className="lab-hud-title">
          experiment 03 · the orbit · {worldsSeen}/{labApps.length} worlds
        </span>
        <Link href="/" className="lab-btn" title="the classic site">
          ◈ classic
        </Link>
      </header>

      <div className={`lab-hint${hint && !chamber ? "" : " off"}`} aria-live="polite">
        {hint ?? ""}
      </div>

      {!chamber && !intro && (
        <div className="orbit-compass" role="group" aria-label="Flight compass">
          <button
            className="oc-btn oc-up"
            aria-label="look up"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              engineRef.current?.setLookHeld(0, -1);
            }}
            onPointerUp={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerCancel={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerLeave={() => engineRef.current?.setLookHeld(0, 0)}
          >
            ‹
          </button>
          <button
            className="oc-btn oc-left"
            aria-label="look left"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              engineRef.current?.setLookHeld(-1, 0);
            }}
            onPointerUp={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerCancel={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerLeave={() => engineRef.current?.setLookHeld(0, 0)}
          >
            ‹
          </button>
          <button
            className="oc-go"
            aria-label="carry me onward"
            title="carry me onward"
            onClick={() => engineRef.current?.travelNext()}
          >
            ◉
          </button>
          <button
            className="oc-btn oc-right"
            aria-label="look right"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              engineRef.current?.setLookHeld(1, 0);
            }}
            onPointerUp={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerCancel={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerLeave={() => engineRef.current?.setLookHeld(0, 0)}
          >
            ›
          </button>
          <button
            className="oc-btn oc-down"
            aria-label="look down"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              engineRef.current?.setLookHeld(0, 1);
            }}
            onPointerUp={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerCancel={() => engineRef.current?.setLookHeld(0, 0)}
            onPointerLeave={() => engineRef.current?.setLookHeld(0, 0)}
          >
            ›
          </button>
        </div>
      )}

      {/* chambers */}
      {chamber?.kind === "world" && chamberEntry && (
        <AppDossier entry={chamberEntry} onClose={releaseChamber} />
      )}

      {chamber?.kind === "core" && (
        <div
          className="dossier-veil"
          role="dialog"
          aria-modal="true"
          aria-label="The operator"
          onClick={(e) => {
            if (e.target === e.currentTarget) releaseChamber();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") releaseChamber();
          }}
          style={{ "--dossier-accent": "#e8dcb0" } as CSSProperties}
        >
          <div className="dossier" tabIndex={-1}>
            <span className="dossier-glyph" aria-hidden>
              {operator.monogram}
            </span>
            <button className="dossier-close" onClick={releaseChamber} aria-label="Close">
              ✕
            </button>
            <div className="pill-row">
              <span className="pill" style={{ color: "#e8dcb0" }}>
                <span className="chip-dot" aria-hidden />
                the operator
              </span>
              <span className="pill">poker → ai builder</span>
            </div>
            <h2>{operator.name}</h2>
            <p className="lede">{operator.line}</p>
            <h3>The arc</h3>
            {operator.arc.map((para, i) => (
              <p key={i} style={{ marginBottom: 10 }}>
                {para}
              </p>
            ))}
            <div className="dossier-foot">
              <span className="pill">six worlds circle this sun — go see them</span>
              <button className="lab-btn" onClick={releaseChamber}>
                ← release · back to space
              </button>
            </div>
          </div>
        </div>
      )}

      {chamber?.kind === "gate" && (
        <div
          className="dossier-veil"
          role="dialog"
          aria-modal="true"
          aria-label="Open a channel"
          onClick={(e) => {
            if (e.target === e.currentTarget) releaseChamber();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") releaseChamber();
          }}
          style={{ "--dossier-accent": GOLD } as CSSProperties}
        >
          <div className="dossier" tabIndex={-1}>
            <span className="dossier-glyph" aria-hidden>
              ◈
            </span>
            <button className="dossier-close" onClick={releaseChamber} aria-label="Close">
              ✕
            </button>
            <div className="pill-row">
              <span className="pill" style={{ color: GOLD }}>
                <span className="chip-dot" aria-hidden />
                the channel
              </span>
              <span className="pill">
                {worldsSeen}/{labApps.length} worlds seen
              </span>
            </div>
            <h2>The system keeps growing.</h2>
            <p className="lede">
              Every world out there began as one person&rsquo;s itch. The next
              one might begin as a conversation.
            </p>
            <div className="dossier-foot" style={{ justifyContent: "flex-start" }}>
              <a className="lab-btn" href={`mailto:${operator.contact.email}`}>
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
            <div className="dossier-foot">
              <button className="lab-btn" onClick={releaseChamber}>
                ← release · back to space
              </button>
            </div>
          </div>
        </div>
      )}

      {intro && (
        <div
          className={`orbit-intro${intro ? "" : " leaving"}`}
          role="button"
          tabIndex={0}
          onClick={() => setIntro(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") setIntro(false);
          }}
        >
          <p className="lab-eyebrow">experiment 03 · the orbit</p>
          <h1>Six worlds. One operator. Gravity decides where you land.</h1>
          <p>
            drag to look · tap to approach · pinch or scroll to sail —
            tap anywhere to begin
          </p>
        </div>
      )}
    </div>
  );
}
