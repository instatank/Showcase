// THE GARDEN engine — a walk through a Japanese temple garden at dusk,
// hand-rolled on Canvas 2D. Scroll is walking, as in The Strip — but the
// path *winds*: the camera follows the stepping stones' tangent, so the
// space unfolds instead of scrolling past. Six stations line the path, each
// a different kind of place (a stone lantern, a hanami tree, a koi pond, a
// shishi-odoshi, a tea house on the lake, a zen garden), and each opens up
// when reached — The Orbit's chamber instinct grafted onto The Strip's legs.
// The path ends at a temple; the bell is the contact channel.
//
// One world, two skins: 'real' renders a painterly-cinematic dusk
// (atmospheric perspective, bloom, mist, a low sun), 'anime' re-renders the
// SAME geometry cel-style (banded sky, ink outlines, flat shading, puffy
// clouds). The style can be swapped live — only the paint changes.

import { mulberry32, seedFrom } from "./rand";
import { glowSprite, hexRgb, rgba } from "./paint";

export type GardenStyle = "real" | "anime";

export type StationKind = "lantern" | "sakura" | "koi" | "shishi" | "teahouse" | "zen";

export interface GardenStation {
  slug: string;
  name: string;
  accent: string;
  kind: StationKind;
}

const FOV = (62 * Math.PI) / 180;
const NEAR = 3;
const CAM_TRAVEL = 3000;
const VIEW = 1050;
const CAM_Y = 16;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (u: number) => u * u * (3 - 2 * u);

/** Blend two hex colors — the whole atmosphere trick in one function. */
function mixHex(a: string, b: string, u: number): string {
  const [r1, g1, b1] = hexRgb(a);
  const [r2, g2, b2] = hexRgb(b);
  const v = clamp(u, 0, 1);
  return `rgb(${Math.round(r1 + (r2 - r1) * v)},${Math.round(g1 + (g2 - g1) * v)},${Math.round(
    b1 + (b2 - b1) * v
  )})`;
}

/** The winding path — lateral offset as a function of distance walked. */
function pathX(z: number): number {
  return 70 * Math.sin(z * 0.0035) + 40 * Math.sin(z * 0.0011 + 2);
}

// ---------- style configs ----------

interface StyleCfg {
  sky: Array<[number, string]>;
  skyBands: number | null; // anime: posterize into N bands
  stars: number;
  sun: string;
  sunGlow: string;
  sunRays: boolean;
  cloud: "soft" | "puff";
  haze: string; // atmospheric perspective target
  mountains: [string, string, string];
  mountainRim: string | null;
  ground: [string, string];
  stone: string;
  stoneShadow: string;
  water: [string, string];
  waterStreak: string;
  outline: string | null;
  petal: string;
  petalAlpha: number;
  sakura: [string, string, string]; // shadow, base, light
  pine: [string, string];
  maple: [string, string];
  wood: string;
  vermilion: string;
  vermilionDark: string;
  paper: string; // lit windows
  stoneGray: string;
  gravel: string;
  rake: string;
  mist: string;
  grade: boolean;
}

const REAL: StyleCfg = {
  sky: [
    [0, "#232345"],
    [0.42, "#4e4470"],
    [0.66, "#93607f"],
    [0.84, "#d08a70"],
    [1, "#f2b988"],
  ],
  skyBands: null,
  stars: 60,
  sun: "#ffd9a0",
  sunGlow: "#ff9e5e",
  sunRays: false,
  cloud: "soft",
  haze: "#c48a92",
  mountains: ["#6f5a80", "#54486b", "#3b3556"],
  mountainRim: null,
  ground: ["#25321f", "#141f12"],
  stone: "#b7ac91",
  stoneShadow: "#0d150c",
  water: ["#6f6f9e", "#2c3157"],
  waterStreak: "#ffce96",
  outline: null,
  petal: "#f4b8c8",
  petalAlpha: 0.75,
  sakura: ["#b76a86", "#e89bb2", "#f7cdd9"],
  pine: ["#22392a", "#3a5a3e"],
  maple: ["#8a3a2a", "#c96540"],
  wood: "#4a3a30",
  vermilion: "#b8433c",
  vermilionDark: "#7e2b28",
  paper: "#ffd98a",
  stoneGray: "#8d8a93",
  gravel: "#cfc8b4",
  rake: "#a89f88",
  mist: "#cfa9b5",
  grade: true,
};

const ANIME: StyleCfg = {
  sky: [
    [0, "#2b3f8f"],
    [0.4, "#5f6fd0"],
    [0.62, "#c886c9"],
    [0.82, "#ff9e7d"],
    [1, "#ffd98a"],
  ],
  skyBands: 14,
  stars: 90,
  sun: "#fff6de",
  sunGlow: "#ffcf7d",
  sunRays: true,
  cloud: "puff",
  haze: "#b48ad0",
  mountains: ["#7d6bc0", "#5a4d9e", "#3d3579"],
  mountainRim: "#e8c8ff",
  ground: ["#2f5a35", "#1b3a22"],
  stone: "#d8cfae",
  stoneShadow: "#12240f",
  water: ["#7fb8e8", "#3a5fb0"],
  waterStreak: "#ffffff",
  outline: "#27203a",
  petal: "#ffb7d0",
  petalAlpha: 0.95,
  sakura: ["#d86a9a", "#ff9dbe", "#ffd3e2"],
  pine: ["#1f5a34", "#2f8a4c"],
  maple: ["#c04328", "#ff7040"],
  wood: "#5a4030",
  vermilion: "#e84f40",
  vermilionDark: "#9e2f26",
  paper: "#ffe9a0",
  stoneGray: "#a8a4b8",
  gravel: "#efe8cf",
  rake: "#b8ae90",
  mist: "#d8bff0",
  grade: false,
};

// ---------- world ----------

interface Tree {
  x: number;
  z: number;
  h: number;
  type: "sakura" | "pine" | "maple";
  seed: number;
}

interface Petal {
  x: number;
  z: number;
  y0: number;
  fall: number;
  sway: number;
  size: number;
}

interface Placed {
  kind: "station" | "tree" | "torii" | "temple";
  z: number;
  x: number;
  station?: GardenStation;
  stationIndex?: number;
  tree?: Tree;
}

export class GardenEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stations: GardenStation[];
  reducedMotion = false;

  private cfg: StyleCfg = REAL;
  private styleName: GardenStyle = "real";

  private w = 0;
  private h = 0;
  private dpr = 1;
  private f = 600;

  private progress = 0;
  private camZ = 0;
  private camX = 0;
  private yaw = 0;
  private pitch = 0;
  private outroStart = 0.86;
  private activeIndex = -1; // cue ring on the station whose zone we're in

  private stationZ: number[] = [];
  private trees: Tree[] = [];
  private petals: Petal[] = [];
  private stars: { x: number; y: number; m: number }[] = [];
  private toriiZ = 140;
  private templeZ = CAM_TRAVEL + 300;

  private raf = 0;
  private t0 = 0;
  private last = 0;
  private disposed = false;
  private frameEma = 16;
  private quality = 1;

  private skyGrad: CanvasGradient | null = null;
  private vignette: CanvasGradient | null = null;

  constructor(canvas: HTMLCanvasElement, stations: GardenStation[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.stations = stations;
    const rng = mulberry32(seedFrom("garden-sky"));
    this.stars = Array.from({ length: 90 }, () => ({
      x: rng(),
      y: rng() * 0.4,
      m: 0.25 + Math.pow(rng(), 2) * 0.75,
    }));
    this.seedPetals();
  }

  private seedPetals(): void {
    const rng = mulberry32(seedFrom("garden-petals"));
    this.petals = Array.from({ length: 170 }, () => {
      const z = rng() * (CAM_TRAVEL + 300);
      return {
        x: pathX(z) + (rng() * 2 - 1) * 95,
        z,
        y0: rng() * 30,
        fall: 1.6 + rng() * 2.6,
        sway: rng() * Math.PI * 2,
        size: 1.6 + rng() * 2.4,
      };
    });
  }

  setStyle(style: GardenStyle): void {
    this.styleName = style;
    this.cfg = style === "real" ? REAL : ANIME;
    this.rebuildGradients();
  }

  getStyle(): GardenStyle {
    return this.styleName;
  }

  setActiveStation(i: number): void {
    this.activeIndex = i;
  }

  /** Zone centers as scroll fractions + where the outro (temple) begins. */
  layout(zoneFractions: number[], outroStart: number): void {
    this.outroStart = clamp(outroStart, 0.5, 0.97);
    this.stationZ = zoneFractions.map((fr) => fr * CAM_TRAVEL + 170);
    this.templeZ = CAM_TRAVEL + 300;
    // trees — seeded, kept clear of the path corridor and the stations
    const rng = mulberry32(seedFrom("garden-trees"));
    this.trees = [];
    for (let i = 0; i < 52; i++) {
      const z = 40 + rng() * (CAM_TRAVEL + 200);
      const side = rng() < 0.5 ? -1 : 1;
      const x = pathX(z) + side * (36 + rng() * 80);
      const nearStation = this.stationZ.some((sz) => Math.abs(sz - z) < 55);
      if (nearStation) continue;
      const r = rng();
      this.trees.push({
        x,
        z,
        h: 24 + rng() * 16,
        type: r < 0.5 ? "sakura" : r < 0.82 ? "pine" : "maple",
        seed: Math.floor(rng() * 1000),
      });
    }
  }

  setProgress(p: number): void {
    this.progress = clamp(p, 0, 1);
  }

  start(): void {
    this.setStyle(this.styleName);
    this.resize();
    this.t0 = performance.now();
    this.last = this.t0;
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
    this.rebuildGradients();
  }

  private rebuildGradients(): void {
    if (!this.w) return;
    const { ctx, h, w } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    if (this.cfg.skyBands) {
      // posterized — the anime sky is a poster, not a photograph
      const N = this.cfg.skyBands;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const c = this.sampleSky(u);
        sky.addColorStop(clamp(u - 0.001, 0, 1), c);
        sky.addColorStop(clamp(u + (1 / N) * 0.999, 0, 1), c);
      }
    } else {
      for (const [stop, c] of this.cfg.sky) sky.addColorStop(stop, c);
    }
    this.skyGrad = sky;
    const vg = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.48,
      w / 2, h / 2, Math.max(w, h) * 0.78
    );
    vg.addColorStop(0, "rgba(8,6,14,0)");
    vg.addColorStop(1, "rgba(8,6,14,0.5)");
    this.vignette = vg;
  }

  private sampleSky(u: number): string {
    const stops = this.cfg.sky;
    for (let i = 1; i < stops.length; i++) {
      if (u <= stops[i][0]) {
        const [u0, c0] = stops[i - 1];
        const [u1, c1] = stops[i];
        return mixHex(c0, c1, (u - u0) / Math.max(0.0001, u1 - u0));
      }
    }
    return stops[stops.length - 1][1];
  }

  // ---------- projection ----------

  private cy = 1;
  private sy = 0;
  private cp = 1;
  private sp = 0;

  private project(px: number, py: number, pz: number) {
    const dx = px - this.camX;
    const dy = py - CAM_Y;
    const dz = pz - this.camZ;
    const x1 = dx * this.cy - dz * this.sy;
    const z1 = dx * this.sy + dz * this.cy;
    const y2 = dy * this.cp - z1 * this.sp;
    const z2 = dy * this.sp + z1 * this.cp;
    if (z2 < NEAR) return null;
    const scale = this.f / z2;
    return { x: this.w / 2 + x1 * scale, y: this.h / 2 - y2 * scale, z: z2, scale };
  }

  // ---------- frame ----------

  private tick(now: number): void {
    const dt = clamp(now - this.last, 0, 50) / 1000;
    this.last = now;
    const t = (now - this.t0) / 1000;

    this.frameEma = this.frameEma * 0.95 + dt * 1000 * 0.05;
    if (this.frameEma > 27 && this.quality === 1) {
      this.quality = 0.5;
      this.petals = this.petals.filter((_, i) => i % 2 === 0);
      this.resize();
      this.frameEma = 16;
    }

    const targetZ = this.progress * CAM_TRAVEL;
    const chase = this.reducedMotion ? 1 : Math.min(1, dt * 5);
    this.camZ += (targetZ - this.camZ) * chase;
    this.camX = pathX(this.camZ);

    // the gaze follows the stones — with a lookahead so turns feel walked
    const L = 110;
    const targetYaw = Math.atan2(pathX(this.camZ + L) - this.camX, L);
    this.yaw += (targetYaw - this.yaw) * (this.reducedMotion ? 1 : Math.min(1, dt * 3));

    const op = clamp((this.progress - this.outroStart) / (1 - this.outroStart), 0, 1);
    const targetPitch = smooth(op) * 0.22;
    this.pitch += (targetPitch - this.pitch) * (this.reducedMotion ? 1 : Math.min(1, dt * 3.4));

    this.cy = Math.cos(this.yaw);
    this.sy = Math.sin(this.yaw);
    this.cp = Math.cos(this.pitch);
    this.sp = Math.sin(this.pitch);

    this.render(t);
  }

  private horizonY(): number {
    const fwd = this.project(
      this.camX + Math.sin(this.yaw) * 4000,
      0,
      this.camZ + Math.cos(this.yaw) * 4000
    );
    return fwd ? fwd.y : this.h * 0.52;
  }

  private render(t: number): void {
    const { ctx, w, h, cfg } = this;
    const hy = this.horizonY();

    // ----- sky -----
    ctx.fillStyle = this.skyGrad ?? cfg.sky[0][1];
    ctx.save();
    ctx.translate(0, hy - h * 0.62);
    ctx.fillRect(0, 0, w, h * 0.62 + 2);
    ctx.restore();
    ctx.fillStyle = cfg.sky[0][1];
    ctx.fillRect(0, 0, w, Math.max(0, hy - h * 0.62 + 2));

    // stars fade in toward the top / as the gaze lifts
    const starGain = 0.5 + this.pitch * 2.2;
    ctx.fillStyle = "#e8ecff";
    for (let i = 0; i < Math.min(this.stars.length, cfg.stars); i++) {
      const s = this.stars[i];
      const sy = s.y * h + this.pitch * this.f * 0.5;
      if (sy > hy - h * 0.2) continue;
      ctx.globalAlpha = clamp(s.m * starGain * (1 - sy / Math.max(1, hy)), 0, 0.9);
      const sz = cfg.skyBands ? (s.m > 0.7 ? 2.2 : 1.4) : s.m > 0.7 ? 1.8 : 1.1;
      ctx.fillRect(s.x * w, sy, sz, sz);
    }
    ctx.globalAlpha = 1;

    // ----- the low sun -----
    const sunYaw = 0.62; // it sets to the right of the path's opening bend
    let dyaw = sunYaw - this.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    if (Math.abs(dyaw) < 1.35) {
      const sx = w / 2 + dyaw * this.f;
      const sy = hy - h * 0.085 + this.pitch * this.f * 0.5;
      const r = h * (cfg.skyBands ? 0.055 : 0.045);
      const gsz = r * (cfg.skyBands ? 10 : 14);
      ctx.globalAlpha = cfg.skyBands ? 0.55 : 0.75;
      ctx.drawImage(glowSprite(cfg.sunGlow), sx - gsz / 2, sy - gsz / 2, gsz, gsz);
      ctx.globalAlpha = 1;
      if (cfg.sunRays && !this.reducedMotion) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(t * 0.02);
        ctx.fillStyle = rgba(cfg.sunGlow, 0.1);
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(r * 7, -r * 0.9);
          ctx.lineTo(r * 7, r * 0.9);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = cfg.sun;
      ctx.fill();
    }

    // ----- clouds -----
    this.clouds(t, hy);

    // ----- mountains (three ridges, atmospheric) -----
    for (let layer = 2; layer >= 0; layer--) this.ridge(layer, hy, t);

    // ----- ground -----
    const gg = ctx.createLinearGradient(0, hy, 0, h);
    gg.addColorStop(0, mixHex(cfg.ground[0], cfg.haze, 0.55));
    gg.addColorStop(0.25, cfg.ground[0]);
    gg.addColorStop(1, cfg.ground[1]);
    ctx.fillStyle = gg;
    ctx.fillRect(0, hy - 1, w, h - hy + 1);

    // ----- the lake -----
    this.lake(t, hy);

    // ----- stepping stones -----
    this.stones();

    // ----- the placed world, far → near -----
    const placed: Placed[] = [];
    for (const tr of this.trees)
      if (tr.z > this.camZ + NEAR && tr.z < this.camZ + VIEW) placed.push({ kind: "tree", z: tr.z, x: tr.x, tree: tr });
    this.stationZ.forEach((z, i) => {
      if (z > this.camZ + NEAR - 40 && z < this.camZ + VIEW) {
        const side = i % 2 === 0 ? -1 : 1;
        placed.push({ kind: "station", z, x: pathX(z) + side * 30, station: this.stations[i], stationIndex: i });
      }
    });
    if (this.toriiZ > this.camZ + NEAR - 10 && this.toriiZ < this.camZ + VIEW)
      placed.push({ kind: "torii", z: this.toriiZ, x: pathX(this.toriiZ) });
    if (this.templeZ < this.camZ + VIEW * 1.6)
      placed.push({ kind: "temple", z: this.templeZ, x: pathX(this.templeZ) });
    placed.sort((a, b) => b.z - a.z);
    for (const pl of placed) this.drawPlaced(pl, t);

    // ----- petals -----
    this.drawPetals(t);

    // ----- mist bands (hugging the ground just past the horizon) -----
    const mistA = cfg.skyBands ? 0.055 : 0.075;
    for (let i = 0; i < 2; i++) {
      const my = hy + 4 + i * 22;
      const drift = this.reducedMotion ? 0 : ((t * (6 + i * 4)) % (w * 1.4)) - w * 0.2;
      const mg = ctx.createLinearGradient(0, my - 12, 0, my + 14);
      mg.addColorStop(0, rgba(cfg.mist, 0));
      mg.addColorStop(0.5, rgba(cfg.mist, mistA));
      mg.addColorStop(1, rgba(cfg.mist, 0));
      ctx.fillStyle = mg;
      ctx.fillRect(drift - w * 0.5, my - 12, w * 1.2, 26);
      ctx.fillRect(drift + w * 0.4, my - 12, w * 0.9, 26);
    }

    // ----- grade + vignette -----
    if (cfg.grade) {
      const grade = ctx.createLinearGradient(0, 0, w, h);
      grade.addColorStop(0, "rgba(70,60,140,0.10)");
      grade.addColorStop(0.55, "rgba(0,0,0,0)");
      grade.addColorStop(1, "rgba(255,150,80,0.09)");
      ctx.fillStyle = grade;
      ctx.fillRect(0, 0, w, h);
    }
    if (this.vignette) {
      ctx.fillStyle = this.vignette;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // ---------- scenery ----------

  private clouds(t: number, hy: number): void {
    const { ctx, w, cfg } = this;
    const panX = -this.yaw * this.f * 0.3 - (this.reducedMotion ? 0 : t * 3);
    if (cfg.cloud === "soft") {
      for (let i = 0; i < 4; i++) {
        const cx = ((panX * (0.5 + i * 0.16) + i * 420) % (w + 600)) - 300;
        const cy = hy - (0.32 + (i % 3) * 0.12) * this.h;
        const cw = 300 + i * 90;
        ctx.globalAlpha = 0.1;
        ctx.drawImage(glowSprite("#f7d9c8"), cx - cw / 2, cy - cw / 8, cw, cw / 4);
        ctx.globalAlpha = 1;
      }
    } else {
      // cumulus — flat white puffs with an ink line, straight off a cel
      for (let i = 0; i < 3; i++) {
        const cx = ((panX * (0.5 + i * 0.2) + i * 520) % (w + 700)) - 350;
        const cy = hy - (0.34 + (i % 2) * 0.16) * this.h;
        const s = 34 + i * 12;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        const lobes = [
          [-1.6, 0, 0.8],
          [-0.7, -0.5, 1.05],
          [0.3, -0.62, 0.95],
          [1.2, -0.2, 0.85],
          [1.9, 0.05, 0.6],
        ] as const;
        for (const [lx, ly, lr] of lobes) ctx.arc(lx * s, ly * s, lr * s, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,252,244,0.92)";
        ctx.fill();
        if (cfg.outline) {
          ctx.strokeStyle = rgba(cfg.outline, 0.35);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (const [lx, ly, lr] of lobes) {
            ctx.moveTo(lx * s + lr * s, ly * s);
            ctx.arc(lx * s, ly * s, lr * s, 0, Math.PI * 2);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  private ridge(layer: number, hy: number, t: number): void {
    const { ctx, w, cfg } = this;
    const base = hy - 26 - layer * 34;
    const amp = 22 + layer * 18;
    const par = 0.12 + layer * 0.1;
    const off = this.yaw * this.f * (0.32 + layer * 0.12) + this.camZ * par;
    ctx.beginPath();
    ctx.moveTo(0, hy + 2);
    for (let x = 0; x <= w; x += 8) {
      const u = (x + off) * 0.004;
      const y =
        base -
        amp * (0.55 + 0.45 * Math.sin(u * 1.7 + layer * 2.1)) * (0.6 + 0.4 * Math.sin(u * 0.6 + layer));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, hy + 2);
    ctx.closePath();
    const fogU = (2 - layer) * 0.26;
    ctx.fillStyle = mixHex(cfg.mountains[layer], cfg.haze, fogU);
    ctx.fill();
    if (cfg.mountainRim) {
      ctx.strokeStyle = rgba(cfg.mountainRim, 0.4 - layer * 0.1);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    void t;
  }

  private lake(t: number, hy: number): void {
    const { ctx, cfg } = this;
    // fixed world ellipse beside the path's middle stretch
    const cxW = pathX(1350) - 205;
    const czW = 1350;
    const rx = 170;
    const rz = 470;
    if (czW + rz < this.camZ || czW - rz > this.camZ + VIEW * 1.4) return;
    const pts: Array<{ x: number; y: number }> = [];
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      const wx = cxW + Math.cos(a) * rx * (1 + 0.14 * Math.sin(a * 3 + 1));
      const wz = czW + Math.sin(a) * rz * (1 + 0.1 * Math.cos(a * 2));
      const zc = clamp(wz, this.camZ + NEAR + 2, this.camZ + VIEW * 1.6);
      const p = this.project(wx, 0, zc);
      if (!p) continue;
      pts.push({ x: p.x, y: p.y });
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    if (pts.length < 6) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.closePath();
    // clamp the gradient to the viewport — otherwise the deep-water stop
    // lives far below the screen and the visible lake reads as one flat tint
    const gTop = Math.max(minY, hy);
    const gBot = Math.min(maxY, this.h);
    const wg = ctx.createLinearGradient(0, gTop, 0, Math.max(gBot, gTop + 1));
    wg.addColorStop(0, cfg.water[0]);
    wg.addColorStop(1, cfg.water[1]);
    ctx.fillStyle = wg;
    ctx.fill();
    // the sun's streak on the water
    ctx.save();
    ctx.clip();
    const streakX = this.w / 2 + (0.62 - this.yaw) * this.f;
    const sg = ctx.createLinearGradient(0, Math.max(minY, hy), 0, maxY);
    sg.addColorStop(0, rgba(cfg.waterStreak, cfg.skyBands ? 0.5 : 0.4));
    sg.addColorStop(1, rgba(cfg.waterStreak, 0));
    ctx.fillStyle = sg;
    ctx.fillRect(streakX - 26, Math.max(minY, hy), 52, maxY - Math.max(minY, hy));
    // shimmer — short horizontal dashes sliding
    ctx.strokeStyle = rgba(cfg.waterStreak, cfg.skyBands ? 0.5 : 0.42);
    ctx.lineWidth = 1;
    const rows = 7;
    for (let r = 0; r < rows; r++) {
      const y = Math.max(minY, hy) + ((r + 0.5) / rows) * (maxY - Math.max(minY, hy));
      const phase = this.reducedMotion ? 0 : t * (14 + r * 3);
      for (let k = 0; k < 4; k++) {
        const x = ((k * 230 + phase + r * 60) % (this.w + 200)) - 100;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 26 + r * 6, y);
        ctx.stroke();
      }
    }
    ctx.restore();
    if (cfg.outline) {
      ctx.strokeStyle = rgba(cfg.outline, 0.45);
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }

  private stones(): void {
    const { ctx, cfg } = this;
    const step = 26;
    const z0 = Math.ceil((this.camZ + 6) / step) * step;
    for (let z = z0, i = 0; z < this.camZ + 480; z += step, i++) {
      const x = pathX(z) + (Math.floor(z / step) % 2 === 0 ? -3.4 : 3.4);
      const p = this.project(x, 0, z);
      if (!p) continue;
      const rxp = 6.4 * p.scale;
      const ryp = rxp * 0.36;
      // fade both with distance AND as a stone slips underfoot — the nearest
      // stone otherwise fills the bottom of the frame like a dinner plate
      const fog = clamp(1 - (z - this.camZ) / 560, 0, 1);
      const under = clamp((z - this.camZ - 10) / 28, 0, 1);
      ctx.globalAlpha = fog * under;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + ryp * 0.5, rxp * 1.12, ryp * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = cfg.stoneShadow;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rxp, ryp, 0, 0, Math.PI * 2);
      ctx.fillStyle = mixHex(cfg.stone, cfg.haze, (1 - fog) * 0.5);
      ctx.fill();
      if (cfg.outline) {
        ctx.strokeStyle = rgba(cfg.outline, 0.5 * fog);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawPetals(t: number): void {
    const { ctx, cfg } = this;
    const T = this.reducedMotion ? 0 : t;
    for (const pt of this.petals) {
      if (pt.z < this.camZ + NEAR || pt.z > this.camZ + 300) continue;
      const y = 30 - ((pt.y0 + T * pt.fall) % 30);
      const x = pt.x + Math.sin(T * 0.8 + pt.sway) * 4;
      const p = this.project(x, y, pt.z);
      if (!p || p.x < -8 || p.x > this.w + 8) continue;
      // clamp: a petal drifting right past the eye must stay a petal
      const s = Math.min(pt.size * p.scale, 6.5);
      if (s < 0.4) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(pt.sway + T * 0.6);
      ctx.globalAlpha = cfg.petalAlpha * clamp(40 / p.z, 0.25, 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = cfg.petal;
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- placed things ----------

  private drawPlaced(pl: Placed, t: number): void {
    const p = this.project(pl.x, 0, pl.z);
    if (!p) return;
    const fogU = clamp((pl.z - this.camZ) / VIEW, 0, 1) * 0.7;
    const nearFade = clamp((pl.z - this.camZ - 6) / 40, 0, 1);
    if (nearFade <= 0.01) return;
    const s = p.scale;
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = nearFade;
    if (pl.kind === "tree" && pl.tree) this.paintTree(p.x, p.y, s, pl.tree, fogU, t);
    else if (pl.kind === "torii") this.paintTorii(p.x, p.y, s, fogU);
    else if (pl.kind === "temple") this.paintTemple(p.x, p.y, s, fogU, t);
    else if (pl.kind === "station" && pl.station) {
      const cue = pl.stationIndex === this.activeIndex;
      this.paintStation(p.x, p.y, s, pl.station, fogU, t, cue);
      if (pl.z - this.camZ < 520) {
        this.label(p.x, p.y + 16 * s + 26, pl.station.name, pl.station.accent, clamp(1.3 - (pl.z - this.camZ) / 460, 0, 0.95));
      }
    }
    ctx.restore();
  }

  private fogged(c: string, fogU: number): string {
    return mixHex(c, this.cfg.haze, fogU);
  }

  private ink(alpha: number): string | null {
    return this.cfg.outline ? rgba(this.cfg.outline, alpha) : null;
  }

  /** filled polygon in screen px (points relative to base bx,by, unit = world*scale) */
  private poly(bx: number, by: number, s: number, pts: Array<[number, number]>, fill: string, outline = true): void {
    const { ctx } = this;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const sx = bx + x * s;
      const sy = by - y * s;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    const o = this.ink(0.6);
    if (o && outline && s > 0.5) {
      ctx.strokeStyle = o;
      ctx.lineWidth = Math.max(0.8, s * 0.5);
      ctx.stroke();
    }
  }

  private blob(bx: number, by: number, s: number, x: number, y: number, r: number, fill: string): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(bx + x * s, by - y * s, Math.max(0.4, r * s), 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  private paintTree(bx: number, by: number, s: number, tr: Tree, fogU: number, t: number): void {
    const { cfg, ctx } = this;
    const jit = (i: number) => {
      const x = Math.sin(tr.seed * 127.1 + i * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const h = tr.h;
    // trunk
    ctx.strokeStyle = this.fogged(cfg.wood, fogU);
    ctx.lineWidth = Math.max(1, 1.7 * s);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx + (jit(1) - 0.5) * 8 * s, by - h * 0.5 * s, bx + (jit(2) - 0.5) * 10 * s, by - h * 0.72 * s);
    ctx.stroke();
    if (tr.type === "pine") {
      const [dark, light] = cfg.pine;
      for (let i = 0; i < 3; i++) {
        const w0 = (11 - i * 2.6) * (0.9 + jit(i) * 0.2);
        const y0 = h * (0.45 + i * 0.2);
        this.poly(bx, by, s, [[-w0, y0], [0, y0 + 9 - i], [w0, y0]], this.fogged(i === 1 ? light : dark, fogU));
      }
    } else {
      const [shade, base, light] = tr.type === "sakura" ? cfg.sakura : ["#7e3423", cfg.maple[0], cfg.maple[1]];
      const cx = bx + (jit(2) - 0.5) * 10 * s;
      const cy = by - h * 0.72 * s;
      const R = h * 0.34;
      // painterly: shadow mass, then mid, then lit crown toward the sun
      if (!cfg.skyBands) {
        ctx.globalAlpha *= 0.9;
        const gsz = R * 5 * s;
        ctx.drawImage(glowSprite(base), cx - gsz / 2, cy - gsz / 2, gsz, gsz);
        ctx.globalAlpha /= 0.9;
      }
      for (let i = 0; i < 7; i++) {
        const a = jit(i + 10) * Math.PI * 2;
        const rr = R * (0.35 + jit(i + 20) * 0.6);
        const ox = Math.cos(a) * R * 0.75;
        const oy = Math.sin(a) * R * 0.45;
        const tone = oy > 0 ? shade : ox > R * 0.15 ? light : base;
        ctx.beginPath();
        ctx.arc(cx + ox * s, cy - oy * 0.6 * s, Math.max(0.6, rr * s), 0, Math.PI * 2);
        ctx.fillStyle = this.fogged(tone, fogU);
        ctx.fill();
      }
      if (cfg.outline && s > 0.5) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.05 * s, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(cfg.outline, 0.35);
        ctx.lineWidth = Math.max(0.8, s * 0.5);
        ctx.stroke();
      }
    }
    void t;
  }

  private paintTorii(bx: number, by: number, s: number, fogU: number): void {
    const { cfg } = this;
    const v = this.fogged(cfg.vermilion, fogU);
    const vd = this.fogged(cfg.vermilionDark, fogU);
    const W = 17;
    const H = 34;
    // pillars (slightly splayed)
    this.poly(bx, by, s, [[-W, 0], [-W + 2.6, 0], [-W + 3.4, H], [-W + 0.8, H]], v);
    this.poly(bx, by, s, [[W, 0], [W - 2.6, 0], [W - 3.4, H], [W - 0.8, H]], v);
    // nuki (lower beam)
    this.poly(bx, by, s, [[-W - 2, H * 0.74], [W + 2, H * 0.74], [W + 2, H * 0.8], [-W - 2, H * 0.8]], vd);
    // kasagi (top beam, upswept ends)
    this.poly(bx, by, s, [[-W - 6, H * 0.94], [W + 6, H * 0.94], [W + 7.4, H * 1.04], [-W - 7.4, H * 1.04]], v);
    this.poly(bx, by, s, [[-W - 7.4, H * 1.03], [W + 7.4, H * 1.03], [W + 7.4, H * 1.08], [-W - 7.4, H * 1.08]], "#26222c");
    // base stones
    this.blob(bx, by, s, -W + 1.6, 0.6, 2.6, this.fogged(cfg.stoneGray, fogU));
    this.blob(bx, by, s, W - 1.6, 0.6, 2.6, this.fogged(cfg.stoneGray, fogU));
  }

  private paintTemple(bx: number, by: number, s: number, fogU: number, t: number): void {
    const { cfg, ctx } = this;
    const wood = this.fogged(cfg.vermilion, fogU);
    const dark = this.fogged("#2e2b38", fogU);
    // stone base
    this.poly(bx, by, s, [[-34, 0], [34, 0], [31, 6], [-31, 6]], this.fogged(cfg.stoneGray, fogU));
    // columns
    for (const cx of [-24, -12, 0, 12, 24])
      this.poly(bx, by, s, [[cx - 1.4, 6], [cx + 1.4, 6], [cx + 1.4, 26], [cx - 1.4, 26]], wood);
    // interior warmth
    ctx.globalAlpha *= 0.85;
    const gsz = 42 * s;
    ctx.drawImage(glowSprite(cfg.paper), bx - gsz / 2, by - 17 * s - gsz / 2, gsz, gsz);
    ctx.globalAlpha /= 0.85;
    this.poly(bx, by, s, [[-26, 6], [26, 6], [26, 24], [-26, 24]], this.fogged("#1c1826", fogU), false);
    for (const wx of [-16, 0, 16])
      this.poly(bx, by, s, [[wx - 5, 10], [wx + 5, 10], [wx + 5, 21], [wx - 5, 21]], this.fogged(cfg.paper, fogU * 0.4), false);
    // sweeping double roof
    this.poly(bx, by, s, [[-40, 26], [40, 26], [46, 34], [-46, 34]], dark);
    this.poly(bx, by, s, [[-30, 34], [30, 34], [38, 44], [-38, 44]], dark);
    this.poly(bx, by, s, [[-3, 44], [3, 44], [1.6, 50], [-1.6, 50]], wood);
    // the bell, hanging in its frame beside the steps
    const bellX = 52;
    this.poly(bx, by, s, [[bellX - 8, 0], [bellX - 6.4, 0], [bellX - 6.4, 18], [bellX - 8, 18]], dark);
    this.poly(bx, by, s, [[bellX + 8, 0], [bellX + 6.4, 0], [bellX + 6.4, 18], [bellX + 8, 18]], dark);
    this.poly(bx, by, s, [[bellX - 10, 18], [bellX + 10, 18], [bellX + 10, 20.4], [bellX - 10, 20.4]], dark);
    const sway = this.reducedMotion ? 0 : Math.sin(t * 0.4) * 0.6;
    this.poly(bx, by, s, [
      [bellX - 4.6 + sway, 6],
      [bellX + 4.6 + sway, 6],
      [bellX + 3.6 + sway, 16],
      [bellX - 3.6 + sway, 16],
    ], this.fogged("#7a6a45", fogU));
    this.poly(bx, by, s, [[bellX - 4.6 + sway, 10.6], [bellX + 4.6 + sway, 10.6], [bellX + 4.6 + sway, 12], [bellX - 4.6 + sway, 12]], this.fogged("#5a4c30", fogU), false);
  }

  private paintStation(bx: number, by: number, s: number, st: GardenStation, fogU: number, t: number, cue: boolean): void {
    const { ctx, cfg } = this;
    if (cue) {
      const ph = this.reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.8);
      ctx.beginPath();
      ctx.ellipse(bx, by + 2 * s, (16 + ph * 5) * s, (5.5 + ph * 1.8) * s, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(st.accent, 0.25 + ph * 0.4);
      ctx.lineWidth = Math.max(1, s * 0.8);
      ctx.stroke();
    }
    switch (st.kind) {
      case "lantern": {
        const stone = this.fogged(cfg.stoneGray, fogU);
        const T = this.reducedMotion ? 0 : t;
        const breathe = 0.72 + 0.28 * Math.sin(T * 0.8);
        this.poly(bx, by, s, [[-4.4, 0], [4.4, 0], [3.4, 2.6], [-3.4, 2.6]], stone);
        this.poly(bx, by, s, [[-1.2, 2.6], [1.2, 2.6], [1.2, 11], [-1.2, 11]], stone);
        const gsz = 30 * s * breathe;
        ctx.globalAlpha *= 0.9;
        ctx.drawImage(glowSprite(cfg.paper), bx - gsz / 2, by - 14.4 * s - gsz / 2, gsz, gsz);
        ctx.globalAlpha /= 0.9;
        this.poly(bx, by, s, [[-3.6, 11], [3.6, 11], [3.6, 17], [-3.6, 17]], this.fogged("#26222e", fogU));
        this.poly(bx, by, s, [[-2.4, 12.2], [2.4, 12.2], [2.4, 15.8], [-2.4, 15.8]], rgba(cfg.paper, 0.55 + 0.35 * breathe), false);
        this.poly(bx, by, s, [[-5, 17], [5, 17], [0, 21.5], [0, 21.5]], stone);
        this.blob(bx, by, s, 0, 22.4, 1.1, stone);
        break;
      }
      case "sakura": {
        const [shade, base, light] = cfg.sakura;
        ctx.strokeStyle = this.fogged(cfg.wood, fogU);
        ctx.lineWidth = Math.max(1.2, 2.6 * s);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx - 6 * s, by - 14 * s, bx - 2 * s, by - 24 * s);
        ctx.moveTo(bx - 3 * s, by - 16 * s);
        ctx.quadraticCurveTo(bx + 8 * s, by - 22 * s, bx + 12 * s, by - 28 * s);
        ctx.stroke();
        if (!cfg.skyBands) {
          const gsz = 90 * s;
          ctx.globalAlpha *= 0.85;
          ctx.drawImage(glowSprite(base), bx - gsz / 2, by - 30 * s - gsz / 2, gsz, gsz);
          ctx.globalAlpha /= 0.85;
        }
        const lobes: Array<[number, number, number, string]> = [
          [-12, 26, 8, shade], [-4, 32, 9.5, base], [7, 30, 9, base],
          [14, 26, 7, light], [0, 25, 8, shade], [8, 36, 6.5, light], [-9, 35, 6, light],
        ];
        for (const [ox, oy, r, c] of lobes) this.blob(bx, by, s, ox, oy, r, this.fogged(c, fogU));
        if (cfg.outline && s > 0.5) {
          ctx.strokeStyle = rgba(cfg.outline, 0.4);
          ctx.lineWidth = Math.max(0.8, s * 0.5);
          for (const [ox, oy, r] of lobes) {
            ctx.beginPath();
            ctx.arc(bx + ox * s, by - oy * s, r * s, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        // festival lights strung under the canopy
        const T = this.reducedMotion ? 1 : t;
        for (let i = 0; i < 6; i++) {
          const lx = -14 + i * 5.6;
          const ly = 22 - Math.sin((i / 5) * Math.PI) * 4;
          const tw = 0.5 + 0.5 * Math.sin(T * 2.2 + i * 1.7);
          this.blob(bx, by, s, lx, ly, 0.9, rgba(st.accent, 0.4 + tw * 0.6));
        }
        // a slow ring of petals leaving the tree
        if (!this.reducedMotion) {
          const ph = (t * 0.22) % 1;
          for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2 + ph * 1.2;
            const rr = 12 + ph * 22;
            ctx.globalAlpha = (1 - ph) * 0.8;
            this.blob(bx, by, s, Math.cos(a) * rr, 28 + Math.sin(a) * rr * 0.4 - ph * 8, 0.9, cfg.petal);
          }
          ctx.globalAlpha = 1;
        }
        break;
      }
      case "koi": {
        // the pond
        const T = this.reducedMotion ? 0 : t;
        ctx.beginPath();
        ctx.ellipse(bx, by, 17 * s, 6.2 * s, 0, 0, Math.PI * 2);
        const wg = ctx.createLinearGradient(bx, by - 6 * s, bx, by + 6 * s);
        wg.addColorStop(0, this.fogged(cfg.water[0], fogU));
        wg.addColorStop(1, this.fogged(cfg.water[1], fogU));
        ctx.fillStyle = wg;
        ctx.fill();
        const o = this.ink(0.5);
        if (o) {
          ctx.strokeStyle = o;
          ctx.lineWidth = Math.max(0.8, s * 0.5);
          ctx.stroke();
        }
        // rim stones + lily pads
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.4;
          this.blob(bx, by, s, Math.cos(a) * 17.5, -Math.sin(a) * 6.4, 0.9 + (i % 3) * 0.3, this.fogged("#6a6772", fogU));
        }
        this.blob(bx, by, s, -6, 3, 2.2, this.fogged(cfg.pine[1], fogU));
        this.blob(bx, by, s, 4, -2.6, 1.7, this.fogged(cfg.pine[1], fogU));
        // the koi — counted, circling
        for (let i = 0; i < 4; i++) {
          const a = T * 0.55 + i * 1.65;
          const rr = 8 + 2.6 * Math.sin(T * 0.5 + i);
          const kx = Math.cos(a) * rr;
          const ky = Math.sin(a) * rr * 0.34;
          ctx.save();
          ctx.translate(bx + kx * s, by + ky * s);
          ctx.rotate(a + Math.PI / 2 + Math.sin(T * 3 + i) * 0.15);
          ctx.beginPath();
          ctx.ellipse(0, 0, 2.6 * s, 1.05 * s, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 ? "#ff8c42" : "#f5ede0";
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-2.6 * s, 0);
          ctx.lineTo(-4 * s, -0.9 * s);
          ctx.lineTo(-4 * s, 0.9 * s);
          ctx.closePath();
          ctx.fillStyle = i % 2 ? "#e86a2a" : "#ffb27d";
          ctx.fill();
          if (i % 2 === 0) this.blob(0, 0, s, 0.4, 0, 0.7, "#e8542a");
          ctx.restore();
        }
        // a ripple ring now and then
        const rp = (T * 0.5) % 1;
        ctx.beginPath();
        ctx.ellipse(bx + 4 * s, by - 1.4 * s, 4.5 * rp * s + 0.1, 1.7 * rp * s + 0.1, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(cfg.waterStreak, 0.5 * (1 - rp));
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      case "shishi": {
        // the bamboo water hammer — fills, tips, clacks
        const T = this.reducedMotion ? 1.2 : t;
        const green = this.fogged(cfg.pine[1], fogU);
        const bamboo = this.fogged("#8aa85c", fogU);
        // pool
        ctx.beginPath();
        ctx.ellipse(bx + 3 * s, by, 8.5 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.fogged(cfg.water[1], fogU);
        ctx.fill();
        // base rock
        this.blob(bx, by, s, -6, 1, 3.4, this.fogged(cfg.stoneGray, fogU));
        // upright
        ctx.strokeStyle = bamboo;
        ctx.lineWidth = Math.max(1.4, 2 * s);
        ctx.beginPath();
        ctx.moveTo(bx - 6 * s, by - 2 * s);
        ctx.lineTo(bx - 6 * s, by - 13 * s);
        ctx.stroke();
        // spout (fixed, water falls from it)
        ctx.beginPath();
        ctx.moveTo(bx - 6 * s, by - 12.4 * s);
        ctx.lineTo(bx + 1 * s, by - 10.8 * s);
        ctx.stroke();
        // the pivoting arm: fill 0..0.82 (dips slowly), clack 0.82..1 (snaps)
        const ph = (T % 3.2) / 3.2;
        const angle = ph < 0.82 ? -0.06 + (ph / 0.82) * 0.34 : 0.28 - ((ph - 0.82) / 0.18) * 0.5;
        ctx.save();
        ctx.translate(bx + 2 * s, by - 5.5 * s);
        ctx.rotate(angle);
        ctx.strokeStyle = green;
        ctx.lineWidth = Math.max(1.6, 2.4 * s);
        ctx.beginPath();
        ctx.moveTo(-6.5 * s, 0);
        ctx.lineTo(6.5 * s, 0);
        ctx.stroke();
        ctx.fillStyle = this.fogged(cfg.pine[0], fogU);
        ctx.fillRect(4.4 * s, -1.6 * s, 2.4 * s, 3.2 * s);
        ctx.restore();
        // falling water + the clack splash
        ctx.strokeStyle = rgba(cfg.waterStreak, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx + 1 * s, by - 10.6 * s);
        ctx.lineTo(bx + 1.6 * s, by - 6 * s);
        ctx.stroke();
        if (ph > 0.82 && !this.reducedMotion) {
          const sp = (ph - 0.82) / 0.18;
          for (let i = 0; i < 4; i++) {
            this.blob(bx, by, s, 7 + i * 2 * sp, 1 + Math.sin(i) * 1.4 * sp, 0.6, rgba(cfg.waterStreak, 0.8 * (1 - sp)));
          }
          ctx.beginPath();
          ctx.ellipse(bx + 7 * s, by + 0.6 * s, 5 * sp * s, 1.8 * sp * s, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(cfg.waterStreak, 0.6 * (1 - sp));
          ctx.stroke();
        }
        break;
      }
      case "teahouse": {
        const T = this.reducedMotion ? 0 : t;
        const dark = this.fogged("#241f2b", fogU);
        // platform + posts
        this.poly(bx, by, s, [[-13, 0], [13, 0], [12, 2.4], [-12, 2.4]], this.fogged(cfg.wood, fogU));
        for (const px of [-10.5, 10.5])
          this.poly(bx, by, s, [[px - 0.8, 2.4], [px + 0.8, 2.4], [px + 0.8, 12], [px - 0.8, 12]], this.fogged(cfg.wood, fogU));
        // glowing paper wall
        ctx.globalAlpha *= 0.9;
        const gsz = 40 * s;
        ctx.drawImage(glowSprite(cfg.paper), bx - gsz / 2, by - 8 * s - gsz / 2, gsz, gsz);
        ctx.globalAlpha /= 0.9;
        this.poly(bx, by, s, [[-11, 2.4], [11, 2.4], [11, 12], [-11, 12]], this.fogged(cfg.paper, fogU * 0.35), false);
        // shoji grid
        ctx.strokeStyle = rgba("#5a4636", 0.85);
        ctx.lineWidth = Math.max(0.7, s * 0.5);
        for (const gx of [-5.5, 0, 5.5]) {
          ctx.beginPath();
          ctx.moveTo(bx + gx * s, by - 2.4 * s);
          ctx.lineTo(bx + gx * s, by - 12 * s);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(bx - 11 * s, by - 7.2 * s);
        ctx.lineTo(bx + 11 * s, by - 7.2 * s);
        ctx.stroke();
        // roof
        this.poly(bx, by, s, [[-16, 12], [16, 12], [10, 19], [-10, 19]], dark);
        this.poly(bx, by, s, [[-17.5, 11.4], [17.5, 11.4], [16, 13], [-16, 13]], dark, false);
        // steam wisp from the kettle
        ctx.strokeStyle = rgba("#e8e2d8", 0.4);
        ctx.lineWidth = Math.max(0.8, s * 0.7);
        ctx.beginPath();
        const wx = bx + 6 * s;
        ctx.moveTo(wx, by - 13 * s);
        ctx.bezierCurveTo(
          wx + Math.sin(T * 1.3) * 3 * s, by - 17 * s,
          wx - Math.sin(T * 1.1) * 3 * s, by - 20 * s,
          wx + Math.sin(T * 0.9) * 4 * s, by - 24 * s
        );
        ctx.stroke();
        // lantern by the door
        this.blob(bx, by, s, -13.5, 8, 1.2, rgba(cfg.paper, 0.9));
        break;
      }
      case "zen": {
        const T = this.reducedMotion ? 0 : t;
        // gravel bed in perspective
        this.poly(bx, by, s, [[-19, -4], [19, -4], [15, 6], [-15, 6]], this.fogged(cfg.gravel, fogU));
        // raked arcs around two stones — patterns you read like a chart
        ctx.strokeStyle = this.fogged(cfg.rake, fogU);
        ctx.lineWidth = Math.max(0.7, s * 0.45);
        const breathe = 1 + (this.reducedMotion ? 0 : Math.sin(T * 0.4) * 0.03);
        for (const [rx0, ry0] of [[-6, 0.5], [7, -1.5]] as const) {
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.ellipse(bx + rx0 * s, by + ry0 * s, (2.6 + i * 1.9) * breathe * s, (1 + i * 0.72) * breathe * s, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        // long rake lines
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(bx - 17 * s, by + (-2.4 + i * 2.6) * s);
          ctx.lineTo(bx + 17 * s, by + (-3 + i * 2.6) * s);
          ctx.stroke();
        }
        // the stones
        this.blob(bx, by, s, -6, 1.4, 2.6, this.fogged("#5f5c66", fogU));
        this.blob(bx, by, s, -4.6, 2.2, 1.7, this.fogged("#787482", fogU));
        this.blob(bx, by, s, 7, 2.6, 2.1, this.fogged("#5f5c66", fogU));
        break;
      }
    }
  }

  private label(x: number, y: number, title: string, color: string, alpha: number): void {
    if (alpha <= 0.03) return;
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.font = "9px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = rgba(color, 0.8);
    ctx.fillText("S T A T I O N", x, y);
    ctx.font = "13px Georgia, serif";
    ctx.fillStyle = this.cfg.skyBands ? "rgba(255,252,244,0.95)" : "rgba(240,236,244,0.9)";
    ctx.fillText(title, x, y + 15);
    ctx.restore();
  }
}
