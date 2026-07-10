// THE STRIP engine — a night city on rails, hand-rolled on Canvas 2D.
// The camera walks a neon street; scroll position IS the camera position.
// Six landmark buildings (the apps) carry pre-rendered neon signs; filler
// blocks, street lamps, fog and dust give the walk its depth. The street
// ends at an unbuilt lot: a wireframe of the next thing, lit from below.
//
// No dependencies, no React inside — the host component feeds scroll
// progress and zone layout through the public API. Same discipline as the
// UoT Voyage engine: perspective projection by hand, painter's sort, glow
// via pre-rendered sprites (per-frame shadowBlur is too expensive).

import { mulberry32, seedFrom } from "./rand";
import { glowSprite, rgba } from "./paint";

export interface StripLandmark {
  slug: string;
  name: string;
  accent: string;
}

interface Quad {
  z: number; // sort key (near z of the parent building)
  draw: () => void;
}

interface Win {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  color: string;
  lit: boolean;
}

interface Building {
  side: -1 | 1;
  z0: number;
  z1: number;
  h: number;
  depth: number;
  shade: number; // 0..1 facade brightness variation
  accent?: string; // landmarks only
  sign?: HTMLCanvasElement;
  signW: number; // world width of the sign
  signY: number;
  flickerSeed: number;
  windows: Win[];
}

const FOV = (64 * Math.PI) / 180;
const NEAR = 3;
const FACE_X = 62; // building faces
const ROAD_EDGE = 46;
const LAMP_X = 52;
const CAM_TRAVEL = 3000;
const VIEW_DEPTH = 1150;
const CAM_Y = 15;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (u: number) => u * u * (3 - 2 * u);

// ---------- pre-rendered sprites ----------

const spriteCache = new Map<string, HTMLCanvasElement>();

/** Neon sign sprite — text with layered glow, rendered once. */
function signSprite(text: string, color: string, big: boolean): HTMLCanvasElement {
  const key = `sign:${big ? "B" : "s"}:${color}:${text}`;
  let s = spriteCache.get(key);
  if (s) return s;
  const fontSize = big ? 64 : 38;
  const pad = fontSize * 1.4;
  const probe = document.createElement("canvas").getContext("2d")!;
  const font = `800 ${fontSize}px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`;
  probe.font = font;
  const spacing = fontSize * 0.18;
  const chars = text.split("");
  const width =
    chars.reduce((acc, ch) => acc + probe.measureText(ch).width + spacing, 0) - spacing;
  s = document.createElement("canvas");
  s.width = Math.ceil(width + pad * 2);
  s.height = Math.ceil(fontSize * 1.6 + pad);
  const c = s.getContext("2d")!;
  c.font = font;
  c.textBaseline = "middle";
  const y = s.height / 2;
  // halo pass, then bright core pass
  for (const pass of [0, 1] as const) {
    c.shadowColor = color;
    c.shadowBlur = pass === 0 ? fontSize * 0.9 : fontSize * 0.3;
    c.fillStyle = pass === 0 ? rgba(color, 0.85) : "#fff6fb";
    let x = pad;
    for (const ch of chars) {
      c.fillText(ch, x, y);
      x += c.measureText(ch).width + spacing;
    }
  }
  spriteCache.set(key, s);
  return s;
}

// ---------- the engine ----------

export class StripEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private landmarks: StripLandmark[];
  reducedMotion = false;

  private w = 0;
  private h = 0;
  private dpr = 1;
  private f = 600;

  private progress = 0; // scroll target 0..1
  private camZ = 0;
  private camX = 0;
  private pitch = 0;
  private outroStart = 0.86; // progress where the sky takes over

  private buildings: Building[] = [];
  private landmarkZ: number[] = [];
  private stars: { x: number; y: number; m: number; tw: number }[] = [];
  private dust: { x: number; y: number; z: number }[] = [];
  private lampZ: number[] = [];
  private endZ = CAM_TRAVEL + 320; // the unbuilt lot

  private raf = 0;
  private t0 = 0;
  private last = 0;
  private disposed = false;
  private frameEma = 16;
  private quality = 1;

  private skyGrad: CanvasGradient | null = null;
  private vignette: CanvasGradient | null = null;

  constructor(canvas: HTMLCanvasElement, landmarks: StripLandmark[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.landmarks = landmarks;
    const rng = mulberry32(seedFrom("the-strip-sky"));
    this.stars = Array.from({ length: 240 }, () => ({
      x: rng(),
      y: rng() * 0.62,
      m: 0.25 + Math.pow(rng(), 2) * 0.75,
      tw: rng() * Math.PI * 2,
    }));
    this.dust = Array.from({ length: 130 }, () => ({
      x: (rng() * 2 - 1) * 85,
      y: 3 + rng() * 42,
      z: rng() * (CAM_TRAVEL + 400),
    }));
    for (let z = 60; z < CAM_TRAVEL + 240; z += 88) this.lampZ.push(z);
  }

  /** Zone centers as scroll fractions (one per landmark) + outro start. */
  layout(zoneFractions: number[], outroStart: number): void {
    this.outroStart = clamp(outroStart, 0.5, 0.97);
    this.landmarkZ = zoneFractions.map((fr) => fr * CAM_TRAVEL + 150);
    this.buildings = [];
    const rng = mulberry32(seedFrom("the-strip-blocks"));

    // the six landmarks — alternating sides, tallest things on the street
    this.landmarks.forEach((lm, i) => {
      const side = (i % 2 === 0 ? -1 : 1) as -1 | 1;
      const z = this.landmarkZ[i] ?? 300 + i * 420;
      const len = 96;
      const h = 118 + (i % 3) * 16;
      const b: Building = {
        side,
        z0: z - len / 2,
        z1: z + len / 2,
        h,
        depth: 70,
        shade: 0.75,
        accent: lm.accent,
        sign: signSprite(lm.name.toUpperCase(), lm.accent, true),
        signW: 58,
        signY: h * 0.66,
        flickerSeed: seedFrom(lm.slug) % 100,
        windows: [],
      };
      this.seedWindows(b, rng, lm.accent);
      this.buildings.push(b);
    });

    // filler blocks — the city between the work
    const fillerSigns: Array<[string, string]> = [
      ["ALL-IN", "#ffb35c"],
      ["TILT", "#ff6ec7"],
      ["24H", "#9cc4ff"],
      ["RIVER ROOM", "#5ce8c8"],
      ["MOTEL", "#ffd98a"],
      ["THE NUTS", "#c084fc"],
    ];
    let signIdx = 0;
    for (const side of [-1, 1] as const) {
      let z = -80;
      while (z < CAM_TRAVEL + 160) {
        const len = 34 + rng() * 52;
        const gap = 10 + rng() * 26;
        const z0 = z;
        const z1 = z + len;
        z = z1 + gap;
        // leave a plaza around each landmark on its own side
        const nearLm = this.buildings.some(
          (b) => b.accent && b.side === side && z0 < b.z1 + 34 && z1 > b.z0 - 34
        );
        if (nearLm) continue;
        const b: Building = {
          side,
          z0,
          z1,
          h: 24 + Math.pow(rng(), 1.6) * 74,
          depth: 40 + rng() * 50,
          shade: 0.3 + rng() * 0.5,
          signW: 30,
          signY: 0,
          flickerSeed: Math.floor(rng() * 100),
          windows: [],
        };
        // an occasional dive-bar sign for atmosphere
        if (rng() < 0.16 && signIdx < fillerSigns.length && b.h > 40) {
          const [txt, col] = fillerSigns[signIdx++];
          b.sign = signSprite(txt, col, false);
          b.signY = b.h * 0.55;
        }
        this.seedWindows(b, rng);
        this.buildings.push(b);
      }
    }
    this.buildings.sort((a, b) => a.z0 - b.z0);
  }

  private seedWindows(b: Building, rng: () => number, accent?: string): void {
    const cols = Math.floor((b.z1 - b.z0) / 7.5);
    const rows = Math.floor(b.h / 7);
    const x = b.side * FACE_X;
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rng() > (accent ? 0.44 : 0.3)) continue; // most windows dark
        const warm = rng() < 0.62;
        b.windows.push({
          x,
          y: 4 + r * 7,
          z: b.z0 + 4 + c * 7.5,
          w: 2.6,
          h: 3.4,
          color: accent && rng() < 0.35 ? accent : warm ? "#ffd98a" : "#9cc4ff",
          lit: true,
        });
      }
    }
  }

  setProgress(p: number): void {
    this.progress = clamp(p, 0, 1);
  }

  start(): void {
    this.resize();
    this.t0 = performance.now();
    this.last = this.t0;
    // arrive already on target — no swoop-in from z=0 on reload mid-page
    this.camZ = this.progress * CAM_TRAVEL;
    const loop = (now: number) => {
      if (this.disposed) return;
      this.tick(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, this.quality < 1 ? 1.2 : 1.75);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.f = this.h / 2 / Math.tan(FOV / 2);
    const sky = this.ctx.createLinearGradient(0, 0, 0, this.h);
    sky.addColorStop(0, "#04050c");
    sky.addColorStop(0.45, "#0a1024");
    sky.addColorStop(0.72, "#141a33");
    sky.addColorStop(1, "#05070d");
    this.skyGrad = sky;
    const vg = this.ctx.createRadialGradient(
      this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.44,
      this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75
    );
    vg.addColorStop(0, "rgba(3,4,8,0)");
    vg.addColorStop(1, "rgba(3,4,8,0.6)");
    this.vignette = vg;
  }

  // ---------- projection (yaw locked to the street, pitch for the outro) ----------

  private cp = 1;
  private sp = 0;
  private scratch = { x: 0, y: 0, scale: 0, z: 0 };

  private project(px: number, py: number, pz: number) {
    const dx = px - this.camX;
    const dy = py - (CAM_Y + this.pitch * 6);
    const dz = pz - this.camZ;
    const y2 = dy * this.cp - dz * this.sp;
    const z2 = dy * this.sp + dz * this.cp;
    if (z2 < NEAR) return null;
    const scale = this.f / z2;
    const s = this.scratch;
    s.x = this.w / 2 + dx * scale;
    s.y = this.h / 2 - y2 * scale;
    s.scale = scale;
    s.z = z2;
    return s;
  }

  private quadPath(pts: Array<[number, number, number]>): boolean {
    const { ctx } = this;
    ctx.beginPath();
    let started = false;
    for (const [x, y, z] of pts) {
      const p = this.project(x, y, z);
      if (!p) return false;
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    return true;
  }

  // ---------- frame ----------

  private tick(now: number): void {
    const dt = clamp(now - this.last, 0, 50) / 1000;
    this.last = now;
    const t = (now - this.t0) / 1000;

    this.frameEma = this.frameEma * 0.95 + dt * 1000 * 0.05;
    if (this.frameEma > 26 && this.quality === 1) {
      this.quality = 0.5;
      this.resize();
      this.frameEma = 16;
    }

    // camera chases the scroll — buttery, never teleporting
    const targetZ = this.progress * CAM_TRAVEL;
    const chase = this.reducedMotion ? 1 : Math.min(1, dt * 5.2);
    this.camZ += (targetZ - this.camZ) * chase;

    // the walk sways; the outro lifts the gaze to the sky
    const sway = this.reducedMotion ? 0 : Math.sin(this.camZ * 0.012) * 3.2;
    this.camX = sway;
    const op = clamp((this.progress - this.outroStart) / (1 - this.outroStart), 0, 1);
    const targetPitch = smooth(op) * 0.5;
    this.pitch += (targetPitch - this.pitch) * (this.reducedMotion ? 1 : Math.min(1, dt * 4));
    this.cp = Math.cos(this.pitch);
    this.sp = Math.sin(this.pitch);

    this.render(t);
  }

  private render(t: number): void {
    const { ctx, w, h } = this;

    // sky
    ctx.fillStyle = this.skyGrad ?? "#05070d";
    ctx.fillRect(0, 0, w, h);
    const starLift = this.pitch * this.f * 0.9;
    const starGain = 0.55 + this.pitch * 1.6;
    for (const s of this.stars) {
      const sx = s.x * w;
      const sy = s.y * h * 0.9 + starLift * (0.4 + s.m * 0.6);
      if (sy < -4 || sy > h) continue;
      const tw = this.reducedMotion ? 1 : 0.7 + 0.3 * Math.sin(t * 1.4 + s.tw);
      ctx.globalAlpha = clamp(s.m * tw * starGain, 0, 1);
      ctx.fillStyle = "#cdd8ec";
      ctx.fillRect(sx, sy, s.m > 0.8 ? 2 : 1.2, s.m > 0.8 ? 2 : 1.2);
    }
    ctx.globalAlpha = 1;

    // ground
    const horizon = this.project(0, 0, this.camZ + VIEW_DEPTH);
    const hy = horizon ? horizon.y : h * 0.55;
    ctx.fillStyle = "#07090f";
    ctx.fillRect(0, hy, w, h - hy);

    // road edges + center dashes
    this.strokePolyline(-ROAD_EDGE, 0.16);
    this.strokePolyline(ROAD_EDGE, 0.16);
    this.dashes(t);

    // haze band at the horizon
    const hazeH = h * 0.16;
    const haze = ctx.createLinearGradient(0, hy - hazeH / 2, 0, hy + hazeH);
    haze.addColorStop(0, "rgba(20,26,51,0)");
    haze.addColorStop(0.5, "rgba(24,30,58,0.5)");
    haze.addColorStop(1, "rgba(20,26,51,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, hy - hazeH / 2, w, hazeH * 1.5);

    // street lamps (behind buildings is fine — they sit at the curb)
    for (const z of this.lampZ) {
      if (z < this.camZ + NEAR + 2 || z > this.camZ + 780) continue;
      for (const side of [-1, 1]) {
        const base = this.project(side * LAMP_X, 0, z);
        if (!base) continue;
        const bx = base.x;
        const by = base.y;
        const top = this.project(side * LAMP_X, 27, z);
        if (!top) continue;
        const fade = clamp(1 - (z - this.camZ) / 820, 0, 1);
        ctx.strokeStyle = `rgba(90,100,125,${0.5 * fade})`;
        ctx.lineWidth = Math.max(0.6, top.scale * 0.5);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(top.x, top.y);
        ctx.stroke();
        const gs = Math.max(6, top.scale * 16);
        ctx.globalAlpha = 0.75 * fade;
        ctx.drawImage(glowSprite("#ffd98a"), top.x - gs / 2, top.y - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
      }
    }

    // buildings, far → near
    const visible = this.buildings.filter(
      (b) => b.z1 > this.camZ + NEAR + 2 && b.z0 < this.camZ + VIEW_DEPTH
    );
    for (let i = visible.length - 1; i >= 0; i--) this.drawBuilding(visible[i], t);

    // the unbuilt lot at the end of the street
    this.drawUnbuilt(t);

    // dust drifting past the walker
    ctx.fillStyle = "#aab8d4";
    for (const d of this.dust) {
      if (d.z < this.camZ + NEAR || d.z > this.camZ + 150) continue;
      const p = this.project(d.x, d.y, d.z);
      if (!p) continue;
      ctx.globalAlpha = clamp(30 / p.z, 0.04, 0.3);
      ctx.fillRect(p.x, p.y, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;

    // vignette
    if (this.vignette) {
      ctx.fillStyle = this.vignette;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private strokePolyline(x: number, alpha: number): void {
    const { ctx } = this;
    const a = this.project(x, 0, this.camZ + NEAR + 2);
    const b = this.project(x, 0, this.camZ + VIEW_DEPTH);
    if (!a) return;
    const ax = a.x;
    const ay = a.y;
    if (!b) return;
    ctx.strokeStyle = `rgba(140,155,190,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  private dashes(t: number): void {
    const { ctx } = this;
    const phase = this.camZ % 34;
    for (let z = this.camZ + 12 - phase; z < this.camZ + 620; z += 34) {
      const a = this.project(0, 0, z);
      if (!a) continue;
      const ax = a.x;
      const ay = a.y;
      const b = this.project(0, 0, z + 13);
      if (!b) continue;
      const fade = clamp(1 - (z - this.camZ) / 680, 0, 1);
      ctx.strokeStyle = `rgba(216,201,138,${0.22 * fade})`;
      ctx.lineWidth = Math.max(0.8, a.scale * 1.3);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    void t;
  }

  private drawBuilding(b: Building, t: number): void {
    const { ctx } = this;
    const dist = b.z0 - this.camZ;
    const fog = clamp(1 - dist / VIEW_DEPTH, 0.05, 1);
    const xN = b.side * FACE_X;
    const xF = b.side * (FACE_X + b.depth);
    const zA = Math.max(b.z0, this.camZ + NEAR + 2);
    const zB = b.z1;

    // street-facing face
    const base = 14 + b.shade * 16;
    const litUp = b.accent ? 1.6 : 1;
    ctx.globalAlpha = fog;
    if (this.quadPath([[xN, 0, zA], [xN, b.h, zA], [xN, b.h, zB], [xN, 0, zB]])) {
      ctx.fillStyle = `rgb(${Math.round(base * litUp)},${Math.round((base + 6) * litUp)},${Math.round((base + 15) * litUp)})`;
      ctx.fill();
    }
    // near face (toward the walker)
    if (b.z0 > this.camZ + NEAR + 3) {
      if (this.quadPath([[xN, 0, b.z0], [xF, 0, b.z0], [xF, b.h, b.z0], [xN, b.h, b.z0]])) {
        ctx.fillStyle = `rgb(${Math.round(base * 0.55)},${Math.round((base + 6) * 0.55)},${Math.round((base + 15) * 0.6)})`;
        ctx.fill();
      }
    }
    // roofline accent on landmarks
    if (b.accent) {
      const rA = this.project(xN, b.h, zA);
      if (rA) {
        // project() reuses one scratch object — copy before the next call
        const rAx = rA.x;
        const rAy = rA.y;
        const rAscale = rA.scale;
        const rB = this.project(xN, b.h, zB);
        if (rB) {
          ctx.strokeStyle = rgba(b.accent, 0.75 * fog);
          ctx.lineWidth = Math.max(1, rAscale * 0.8);
          ctx.beginPath();
          ctx.moveTo(rAx, rAy);
          ctx.lineTo(rB.x, rB.y);
          ctx.stroke();
        }
      }
    }

    // windows — thin out with distance and under low quality
    if (dist < 760 && b.windows.length) {
      const step = this.quality < 1 || dist > 420 ? 2 : 1;
      for (let i = 0; i < b.windows.length; i += step) {
        const win = b.windows[i];
        if (win.z < this.camZ + NEAR + 2) continue;
        const p = this.project(win.x, win.y, win.z);
        if (!p) continue;
        const s = p.scale;
        ctx.globalAlpha = clamp(fog * 0.9, 0, 1);
        ctx.fillStyle = win.color;
        ctx.fillRect(p.x - (win.w * s) / 2, p.y - win.h * s, win.w * s, win.h * s);
      }
    }
    ctx.globalAlpha = 1;

    // the sign — a billboard facing the walker, with its reflection
    if (b.sign && zB > this.camZ + NEAR + 6) {
      const signZ = clamp((b.z0 + b.z1) / 2, this.camZ + NEAR + 6, b.z1);
      const p = this.project(b.side * (FACE_X - 3), b.signY, signZ);
      if (p) {
        const worldW = b.signW * (b.accent ? 1 : 0.62);
        const sw = worldW * p.scale;
        const sh = sw * (b.sign.height / b.sign.width);
        let flick = 1;
        if (!this.reducedMotion) {
          const f = Math.sin(t * 7.3 + b.flickerSeed) + Math.sin(t * 17.7 + b.flickerSeed * 2);
          flick = f > 1.72 ? 0.35 : 1;
        }
        ctx.globalAlpha = clamp(fog * 1.15, 0, 1) * flick;
        ctx.drawImage(b.sign, p.x - sw / 2, p.y - sh / 2, sw, sh);
        // wet-street reflection
        const g = this.project(b.side * (FACE_X - 3), 0, signZ);
        if (g) {
          ctx.globalAlpha = 0.14 * fog * flick;
          ctx.save();
          ctx.translate(g.x, g.y);
          ctx.scale(1, -0.55);
          ctx.drawImage(b.sign, -sw / 2, -sh * 1.1, sw, sh);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  /** The end of the street: an empty lot, a wireframe of what's next. */
  private drawUnbuilt(t: number): void {
    const { ctx } = this;
    const z = this.endZ;
    if (z - this.camZ > VIEW_DEPTH * 1.4) return;
    const cx = 0;
    const W = 46;
    const D = 60;
    const H = 130;
    const fade = clamp(1 - (z - this.camZ) / (VIEW_DEPTH * 1.3), 0.08, 0.9);

    // light beam rising from the lot (copy scratch before the second project)
    const bBase = this.project(cx, 0, z);
    if (bBase) {
      const baseX = bBase.x;
      const baseY = bBase.y;
      const baseScale = bBase.scale;
      const bTop = this.project(cx, H * 1.7, z);
      if (bTop) {
        const bw = Math.max(10, baseScale * 26);
        const grad = ctx.createLinearGradient(0, bTop.y, 0, baseY);
        grad.addColorStop(0, "rgba(216,201,138,0)");
        grad.addColorStop(1, `rgba(216,201,138,${0.16 * fade + (this.reducedMotion ? 0 : 0.04 * Math.sin(t * 0.9))})`);
        ctx.fillStyle = grad;
        ctx.fillRect(baseX - bw / 2, bTop.y, bw, baseY - bTop.y);
      }
    }

    // dashed wireframe box — the next building, not built yet
    ctx.strokeStyle = `rgba(216,201,138,${0.5 * fade})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 7]);
    const corners: Array<[number, number, number]> = [
      [cx - W, 0, z], [cx + W, 0, z], [cx + W, 0, z + D], [cx - W, 0, z + D],
      [cx - W, H, z], [cx + W, H, z], [cx + W, H, z + D], [cx - W, H, z + D],
    ];
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    for (const [a, b] of edges) {
      const pa = this.project(...corners[a]);
      if (!pa) continue;
      const pax = pa.x;
      const pay = pa.y;
      const pb = this.project(...corners[b]);
      if (!pb) continue;
      ctx.beginPath();
      ctx.moveTo(pax, pay);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}
