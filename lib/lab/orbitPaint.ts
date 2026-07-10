// Per-app world painters for The Orbit — every app is a world with its own
// procedural weather, drawn in screen space. Symbolic geometry only: ticks,
// bands, arcs, filaments. Six kinds:
//
//   clock  (DayOS)      — a dial world: 12 ticks, a sweeping hand, one moon
//   strobe (PartySpark) — a lit room seen from space: pulsing arcs, motes
//   ledger (BillBud)    — banded accounts, a ring of coins on the equator
//   pulse  (Cadence)    — a heartbeat: EKG line, double-beat rings
//   garden (MyMealMap)  — terraced orchard arcs, drifting seeds
//   market (TradeGenie) — candlesticks around the rim, a climbing trend line

import { glowSprite, jitter, rgba } from "./paint";

export type OrbitWorldKind = "clock" | "strobe" | "ledger" | "pulse" | "garden" | "market";

export const worldKindBySlug: Record<string, OrbitWorldKind> = {
  dayos: "clock",
  partyspark: "strobe",
  billbud: "ledger",
  cadence: "pulse",
  mymealmap: "garden",
  tradegenie: "market",
};

export interface OrbitPaintOpts {
  alpha: number;
  visited: boolean;
  seed: number;
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string, lw: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = style;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, style: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = style;
  ctx.fill();
}

export function paintAppWorld(
  ctx: CanvasRenderingContext2D,
  kind: OrbitWorldKind,
  color: string,
  x: number,
  y: number,
  r: number,
  t: number,
  { alpha, visited, seed }: OrbitPaintOpts
): void {
  if (r < 0.4 || alpha <= 0.01) return;
  const lw = Math.max(0.8, r * 0.045);
  ctx.save();
  ctx.globalAlpha = alpha;

  // atmosphere + body
  const spriteSize = r * 6.2;
  ctx.drawImage(glowSprite(color), x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, 0.18);
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = rgba(color, 0.85);
  ctx.stroke();

  ctx.strokeStyle = rgba(color, 0.55);
  ctx.fillStyle = rgba(color, 0.8);
  ctx.lineWidth = lw;

  switch (kind) {
    case "clock": {
      // the dial
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI / 6) * i;
        const r1 = r * (i % 3 === 0 ? 0.68 : 0.78);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
        ctx.lineTo(x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88);
        ctx.stroke();
      }
      // the sweeping hand
      const ha = t * 0.35 - Math.PI / 2;
      ctx.strokeStyle = rgba(color, 0.9);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ha) * r * 0.6, y + Math.sin(ha) * r * 0.6);
      ctx.stroke();
      dot(ctx, x, y, lw * 1.3, rgba(color, 0.95));
      // one moon — the day, going around
      const ma = t * 0.5;
      dot(ctx, x + Math.cos(ma) * r * 1.45, y + Math.sin(ma) * r * 1.45 * 0.42, Math.max(1, r * 0.09), rgba(color, 0.9));
      break;
    }
    case "strobe": {
      // the beat: brightness arrives in pulses
      const beat = Math.pow(Math.max(0, Math.sin(t * 2.4)), 6);
      for (let i = 0; i < 3; i++) {
        const ph = ((t * 0.5 + i / 3) % 1);
        ctx.globalAlpha = alpha * (1 - ph) * (0.35 + beat * 0.65);
        ring(ctx, x, y, r * (0.4 + ph * 1.5), rgba(color, 0.8), lw * (1.4 - ph));
      }
      ctx.globalAlpha = alpha;
      // motes circling the room
      for (let k = 0; k < 8; k++) {
        const a = t * (0.8 + jitter(seed, k) * 0.7) + k;
        const rad = r * (0.5 + jitter(seed, k + 8) * 0.75);
        dot(ctx, x + Math.cos(a) * rad, y + Math.sin(a) * rad, Math.max(0.8, lw * (0.7 + beat * 0.8)), rgba(color, 0.85));
      }
      break;
    }
    case "ledger": {
      // account bands, clipped to the disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.94, 0, Math.PI * 2);
      ctx.clip();
      for (let i = -3; i <= 3; i++) {
        const by = y + i * r * 0.26;
        ctx.globalAlpha = alpha * (i % 2 === 0 ? 0.5 : 0.22);
        ctx.beginPath();
        ctx.moveTo(x - r, by);
        ctx.lineTo(x + r, by);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = alpha;
      // the coin ring on the equator
      for (let k = 0; k < 10; k++) {
        const a = t * 0.25 + (k * Math.PI * 2) / 10;
        dot(ctx, x + Math.cos(a) * r * 1.38, y + Math.sin(a) * r * 1.38 * 0.32, Math.max(0.9, lw * 1.1), rgba(color, 0.55 + 0.35 * Math.sin(a + t)));
      }
      break;
    }
    case "pulse": {
      // the EKG across the face
      ctx.beginPath();
      const beatPh = (t * 1.1) % 1;
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const px = x - r * 0.8 + u * r * 1.6;
        let py = y;
        const d = Math.abs(u - 0.5);
        if (d < 0.12) {
          const s = 1 - d / 0.12;
          py = y - Math.sin(u * 40) * r * 0.34 * s * (0.6 + 0.4 * Math.sin(t * 6.9));
        }
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgba(color, 0.85);
      ctx.stroke();
      // double-beat rings (lub-dub)
      for (const off of [0, 0.18]) {
        const ph = (beatPh + 1 - off) % 1;
        if (ph < 0.75) {
          ctx.globalAlpha = alpha * (1 - ph / 0.75) * 0.7;
          ring(ctx, x, y, r * (1.05 + ph * 0.9), rgba(color, 0.8), lw * 0.9);
        }
      }
      ctx.globalAlpha = alpha;
      break;
    }
    case "garden": {
      // terraces — nested arcs, slightly off-center like contour lines
      for (let i = 1; i <= 4; i++) {
        const rr = r * (0.22 * i);
        const wob = Math.sin(t * 0.6 + i) * 0.16;
        ctx.beginPath();
        ctx.arc(x - r * 0.08 * i * 0.4, y + r * 0.05 * i * 0.3, rr, 0.4 + wob, Math.PI * 2 - 0.4 + wob);
        ctx.strokeStyle = rgba(color, 0.6 - i * 0.08);
        ctx.stroke();
      }
      // seeds drifting off the surface
      for (let k = 0; k < 6; k++) {
        const ph = (t * 0.14 + jitter(seed, k)) % 1;
        const a = jitter(seed, k + 6) * Math.PI * 2;
        ctx.globalAlpha = alpha * (1 - ph) * 0.8;
        dot(ctx, x + Math.cos(a) * r * (1 + ph * 0.9), y + Math.sin(a) * r * (1 + ph * 0.9), Math.max(0.7, lw * 0.8), rgba(color, 0.85));
      }
      ctx.globalAlpha = alpha;
      break;
    }
    case "market": {
      // candlesticks around the rim
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI * 2) / 12 + t * 0.06;
        const up = jitter(seed, k) > 0.42;
        const len = r * (0.16 + jitter(seed, k + 12) * 0.2);
        const r0 = r * 1.12;
        const cx1 = x + Math.cos(a) * r0;
        const cy1 = y + Math.sin(a) * r0;
        const cx2 = x + Math.cos(a) * (r0 + len);
        const cy2 = y + Math.sin(a) * (r0 + len);
        ctx.strokeStyle = rgba(color, up ? 0.9 : 0.35);
        ctx.lineWidth = lw * (up ? 1.5 : 1);
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();
      }
      ctx.lineWidth = lw;
      // the climbing line across the face
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const px = x - r * 0.7 + u * r * 1.4;
        const py = y + r * 0.42 - u * r * 0.7 + Math.sin(u * 9 + seed) * r * 0.12;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgba(color, 0.75);
      ctx.stroke();
      break;
    }
  }

  if (visited) {
    // a small settled satellite marks what you've landed on
    const ang = t * 0.6 + seed;
    dot(ctx, x + Math.cos(ang) * r * 1.62, y + Math.sin(ang) * r * 1.62 * 0.5, Math.max(1, lw), "rgba(232,220,176,0.9)");
  }

  ctx.restore();
}

/** The core — the operator's sun. */
export function paintCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  alpha: number,
  reduced: boolean
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const pulse = reduced ? 1 : 1 + Math.sin(t * 0.7) * 0.04;
  const sz = r * 9 * pulse;
  ctx.drawImage(glowSprite("#e8dcb0"), x - sz / 2, y - sz / 2, sz, sz);
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(240,232,200,0.95)";
  ctx.fill();
  // corona — a slow card-fan of rays (the tell: this sun was a dealer once)
  ctx.strokeStyle = "rgba(232,220,176,0.35)";
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  for (let i = 0; i < 10; i++) {
    const a = (reduced ? 0 : t * 0.03) + (Math.PI / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5);
    ctx.lineTo(x + Math.cos(a) * r * (2.1 + (i % 2) * 0.5), y + Math.sin(a) * r * (2.1 + (i % 2) * 0.5));
    ctx.stroke();
  }
  ctx.restore();
}

/** The gate — a doorway of gold standing open in space. */
export function paintGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  alpha: number,
  cue: boolean,
  reduced: boolean
): void {
  const gold = "#d8c98a";
  ctx.save();
  ctx.globalAlpha = alpha;
  const sz = r * 8;
  ctx.drawImage(glowSprite(gold), x - sz / 2, y - sz / 2, sz, sz);
  // pillar of light
  ctx.globalCompositeOperation = "lighter";
  const bh = r * 12;
  const bg = ctx.createLinearGradient(x, y - bh / 2, x, y + bh / 2);
  bg.addColorStop(0, rgba(gold, 0));
  bg.addColorStop(0.5, rgba(gold, cue ? 0.3 : 0.16));
  bg.addColorStop(1, rgba(gold, 0));
  ctx.fillStyle = bg;
  ctx.fillRect(x - r * 0.3, y - bh / 2, r * 0.6, bh);
  ctx.globalCompositeOperation = "source-over";
  // the ring
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.strokeStyle = rgba(gold, 0.95);
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.78, r * 1.16, 0, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(gold, 0.5);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.stroke();
  if (!reduced) {
    for (let i = 0; i < 5; i++) {
      const ang = t * 0.9 + (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r * 1.45, Math.max(1, r * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = rgba(gold, 0.85);
      ctx.fill();
    }
  }
  ctx.restore();
}
