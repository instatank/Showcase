"use client";

// The dossier — the one shared detail surface across all three experiments.
// Every immersive scene resolves into the SAME facts (data/apps.ts), the way
// UoT's three geometries share one session model: only the way in differs.

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { isBlank, scrub, statusColor, type LabApp } from "@/lib/lab/content";

export default function AppDossier({
  entry,
  onClose,
}: {
  entry: LabApp;
  onClose: () => void;
}) {
  const { app, id, index } = entry;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const built = scrub(app.howItWasBuilt);

  return (
    <div
      className="dossier-veil"
      role="dialog"
      aria-modal="true"
      aria-label={app.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ "--dossier-accent": id.accent } as CSSProperties}
    >
      <div className="dossier" ref={panelRef} tabIndex={-1}>
        <span className="dossier-glyph" aria-hidden>
          {id.glyph}
        </span>
        <button className="dossier-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="pill-row">
          <span className="pill" style={{ color: statusColor[app.statusTag] }}>
            <span className="chip-dot" aria-hidden />
            {app.statusTag}
          </span>
          <span className="pill">{String(index + 1).padStart(2, "0")} / 06</span>
          <span className="pill">{id.flavor}</span>
        </div>

        <h2>{app.name}</h2>
        <p className="lede">{scrub(app.oneLiner)}</p>

        {!isBlank(app.theItch) && (
          <>
            <h3>The itch</h3>
            <p>{scrub(app.theItch)}</p>
          </>
        )}

        <h3>What it does</h3>
        <ul>
          {app.features.map((f) => (
            <li key={f}>{isBlank(f) ? "— being written —" : scrub(f)}</li>
          ))}
        </ul>

        {!isBlank(built) && (
          <>
            <h3>How it was built</h3>
            <p>{built}</p>
          </>
        )}

        <div className="dossier-foot">
          <Link href={`/apps/${app.slug}`} className="lab-btn">
            open the classic page ↗
          </Link>
          <button className="lab-btn" onClick={onClose}>
            ← back out
          </button>
        </div>
      </div>
    </div>
  );
}
