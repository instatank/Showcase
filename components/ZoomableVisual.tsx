"use client";

import { useEffect, useState } from "react";
import type { Visual as VisualType } from "@/data/apps";

/**
 * ZoomableVisual — makes a real screenshot on the detail page click-to-expand.
 *
 * Wraps the rendered <Visual> (passed as children) and, on click, opens a
 * full-screen lightbox showing the screenshot large. Esc / clicking the
 * backdrop / the close button dismisses it. Placeholder (non-real) visuals are
 * left untouched and non-interactive.
 */
export default function ZoomableVisual({
  visual,
  children,
}: {
  visual: VisualType;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Non-real visuals are placeholders — leave them static.
  if (!visual.real) return <>{children}</>;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Expand screenshot: ${visual.alt}`}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group/zoom relative block cursor-zoom-in rounded-2xl outline-none transition-transform duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        {children}
        {/* hover hint */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-paper/90 px-3 py-1.5 font-mono text-[11px] text-ink opacity-0 backdrop-blur transition-opacity duration-300 group-hover/zoom:opacity-100">
          ⤢ click to expand
        </span>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={visual.alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/92 p-4 backdrop-blur-md sm:p-8"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-ink transition-colors hover:bg-white/10"
          >
            ✕
          </button>
          {/* stop propagation so clicks on the image don't close it */}
          <img
            src={visual.src}
            alt={visual.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] w-auto max-w-full rounded-3xl shadow-2xl ring-1 ring-white/10"
          />
          <p className="max-w-xl text-center font-mono text-xs text-muted">
            {visual.caption}
          </p>
        </div>
      )}
    </>
  );
}
