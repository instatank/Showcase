// THE ORBIT engine — first-person flight through the builder's system,
// hand-rolled on Canvas 2D. Direct descendant of UoT's Voyage engine:
// perspective projection, gentle cruise, gravitational capture into orbit,
// autopilot travel, compass look, idle auto-drift. Specialized here for a
// showcase: one sun (the operator's story), six worlds (the apps), one
// gold gate (the contact channel). Everything is open from the first frame
// — a portfolio has no locked doors.

import { glowSprite, rgba } from "./paint";
import { paintAppWorld, paintCore, paintGate, type OrbitWorldKind } from "./orbitPaint";

export type OrbitKind = "core" | "world" | "gate";

export interface OrbitTarget {
  id: string;
  kind: OrbitKind;
  pos: [number, number, number];
  r: number;
  title: string;
  subtitle?: string;
  color: string;
  worldKind?: OrbitWorldKind;
  visited: boolean;
  cue?: boolean; // breathes — the suggested next stop
}

export interface OrbitCallbacks {
  onCapture: (id: string) => void;
  onHint: (hint: string | null) => void;
}

type Mode = "free" | "autopilot" | "orbit";

interface V3 {
  x: number;
  y: number;
  z: number;
}

const FOV = (68 * Math.PI) / 180;
const NEAR = 2;
const STAR_COUNT = 800;
const DUST_COUNT = 220;
const SKY_R = 2600;
const CRUISE = 10;
const THRUST_MAX = 170;
const CAPTURE_FACTOR = 3.6;
const GRAVITY_RANGE = 9;
const BOUND = 1400;

const easeInOut = (u: number) => u * u * (3 - 2 * u);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const v3 = (x = 0, y = 0, z = 0): V3 => ({ x, y, z });
const sub = (a: V3, b: V3): V3 => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const len = (a: V3): number => Math.hypot(a.x, a.y, a.z);
const norm = (a: V3): V3 => {
  const l = len(a) || 1;
  return v3(a.x / l, a.y / l, a.z / l);
};
const lerp3 = (a: V3, b: V3, u: number): V3 =>
  v3(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.z + (b.z - a.z) * u);

interface Star {
  p: V3;
  m: number;
  warm: boolean;
  tw: number;
}

export class OrbitEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: OrbitCallbacks;
  targets: OrbitTarget[] = [];
  reducedMotion = false;

  // camera
  private pos: V3 = v3();
  private yaw = 0;
  private pitch = 0;
  private f = 600;
  private w = 0;
  private h = 0;
  private dpr = 1;

  // flight
  private mode: Mode = "free";
  private speed = 0;
  private wheelImpulse = 0;
  private captured: OrbitTarget | null = null;

  // autopilot
  private apFrom: V3 = v3();
  private apTo: V3 = v3();
  private apLook0: { yaw: number; pitch: number } | null = null;
  private apTarget: V3 = v3();
  private apStart = 0;
  private apDur = 1;

  // orbit
  private orbitAngle = 0;
  private orbitDist = 100;
  private orbitY = 0;

  // lift-off after release — gravity must not instantly re-capture
  private escape: { id: string; dir: V3; until: number } | null = null;

  // gaze guidance (orientToward) — user input cancels it
  private gaze: { p: V3; yaw0: number; pitch0: number; t0: number; dur: number } | null = null;

  // sky
  private stars: Star[] = [];
  private dust: V3[] = [];

  // input
  private drag: { x: number; y: number; sx: number; sy: number; slop: number; moved: boolean; id: number } | null = null;
  private pinch: { idA: number; idB: number; a: { x: number; y: number }; b: { x: number; y: number }; lastD: number } | null = null;
  private keys = new Set<string>();
  private lookHeld = { x: 0, y: 0 };
  private lastInput = 0;

  private raf = 0;
  private last = 0;
  private t0 = 0;
  private disposed = false;
  private frameEma = 16;
  private quality = 1;
  private dprCap = 1.75;
  private vignette: CanvasGradient | null = null;

  // per-frame trig + allocation-free projection scratch
  private cyF = 1;
  private syF = 0;
  private cpF = 1;
  private spF = 0;
  private scratch = { x: 0, y: 0, z: 0, scale: 0 };

  constructor(canvas: HTMLCanvasElement, cb: OrbitCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cb = cb;
    this.seedSky();
  }

  // ---------- public API ----------

  start(targets: OrbitTarget[], camPos: [number, number, number], lookAt: [number, number, number]): void {
    this.targets = targets;
    this.pos = v3(...camPos);
    this.lookToward(v3(...lookAt));
    this.resize();
    this.bind();
    this.t0 = performance.now();
    this.last = this.t0;
    this.lastInput = this.t0;
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
    this.unbind();
  }

  patchTarget(id: string, patch: Partial<OrbitTarget>): void {
    const t = this.targets.find((x) => x.id === id);
    if (t) Object.assign(t, patch);
  }

  travelTo(id: string): void {
    const t = this.targets.find((x) => x.id === id);
    if (!t) return;
    const tp = v3(...t.pos);
    const stand = t.r * 3.1;
    const dir = norm(sub(this.pos, tp));
    const dest = v3(tp.x + dir.x * stand, tp.y + dir.y * stand * 0.6 + t.r * 0.5, tp.z + dir.z * stand);
    this.escape = null;
    this.gaze = null;
    this.captured = t;
    this.orbitDist = stand;
    if (this.reducedMotion) {
      this.pos = dest;
      this.enterOrbit(t);
      return;
    }
    this.apFrom = { ...this.pos };
    this.apTo = dest;
    this.apTarget = tp;
    this.apLook0 = { yaw: this.yaw, pitch: this.pitch };
    this.apStart = performance.now();
    this.apDur = clamp(len(sub(dest, this.pos)) / 220, 1.3, 3.2) * 1000;
    this.mode = "autopilot";
  }

  setLookHeld(x: number, y: number): void {
    this.lookHeld.x = x;
    this.lookHeld.y = y;
    this.lastInput = performance.now();
    if (x !== 0 || y !== 0) this.gaze = null;
  }

  /** The compass center — carry me onward. */
  travelNext(): void {
    const next = this.nextDestination();
    if (next) this.travelTo(next.id);
  }

  private nextDestination(): OrbitTarget | null {
    const cue = this.targets.find((t) => t.cue);
    if (cue) return cue;
    let best: OrbitTarget | null = null;
    let bestD = Infinity;
    for (const t of this.targets) {
      if (t.kind !== "world" || t.visited) continue;
      const d = len(sub(v3(...t.pos), this.pos));
      if (d < bestD) {
        best = t;
        bestD = d;
      }
    }
    if (best) return best;
    return this.targets.find((t) => t.kind === "gate") ?? null;
  }

  orientToward(p: [number, number, number], ms = 1700): void {
    const target = v3(...p);
    if (this.reducedMotion) {
      this.lookToward(target);
      return;
    }
    this.gaze = { p: target, yaw0: this.yaw, pitch0: this.pitch, t0: performance.now(), dur: ms };
  }

  release(): void {
    const from = this.captured;
    this.captured = null;
    this.mode = "free";
    this.speed = 0;
    this.wheelImpulse = 0;
    if (from) {
      this.escape = {
        id: from.id,
        dir: norm(sub(this.pos, v3(...from.pos))),
        until: performance.now() + 1500,
      };
    }
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.f = this.h / 2 / Math.tan(FOV / 2);
    const vg = this.ctx.createRadialGradient(
      this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.42,
      this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.72
    );
    vg.addColorStop(0, "rgba(4,6,11,0)");
    vg.addColorStop(1, "rgba(4,6,11,0.55)");
    this.vignette = vg;
  }

  // ---------- input ----------

  private onPointerDown = (e: PointerEvent) => {
    this.lastInput = performance.now();
    if (this.pinch) return;
    if (this.drag) {
      this.canvas.setPointerCapture(e.pointerId);
      const a = { x: this.drag.x, y: this.drag.y };
      const b = { x: e.clientX, y: e.clientY };
      this.pinch = { idA: this.drag.id, idB: e.pointerId, a, b, lastD: Math.hypot(a.x - b.x, a.y - b.y) };
      this.drag = null;
      return;
    }
    this.canvas.setPointerCapture(e.pointerId);
    this.drag = {
      x: e.clientX,
      y: e.clientY,
      sx: e.clientX,
      sy: e.clientY,
      slop: e.pointerType === "touch" ? 9 : 4,
      moved: false,
      id: e.pointerId,
    };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.pinch) {
      const p = this.pinch;
      if (e.pointerId === p.idA) p.a = { x: e.clientX, y: e.clientY };
      else if (e.pointerId === p.idB) p.b = { x: e.clientX, y: e.clientY };
      else return;
      this.lastInput = performance.now();
      const d = Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y);
      if (this.mode === "free") {
        this.gaze = null;
        this.wheelImpulse = clamp(this.wheelImpulse + (d - p.lastD) * 1.4, -160, 260);
      }
      p.lastD = d;
      return;
    }
    if (!this.drag || this.drag.id !== e.pointerId) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    if (Math.hypot(e.clientX - this.drag.sx, e.clientY - this.drag.sy) > this.drag.slop)
      this.drag.moved = true;
    if (this.drag.moved && this.mode === "free") {
      this.lastInput = performance.now();
      this.gaze = null;
      this.yaw -= dx * 0.0032;
      this.pitch = clamp(this.pitch + dy * 0.0028, -1.35, 1.35);
    }
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.lastInput = performance.now();
    if (this.pinch) {
      if (e.pointerId === this.pinch.idA || e.pointerId === this.pinch.idB) this.pinch = null;
      return;
    }
    if (!this.drag || this.drag.id !== e.pointerId) return;
    const d = this.drag;
    this.drag = null;
    if (d.moved) return;
    const rect = this.canvas.getBoundingClientRect();
    this.pick(e.clientX - rect.left, e.clientY - rect.top);
  };

  private onPointerCancel = (e: PointerEvent) => {
    if (this.pinch && (e.pointerId === this.pinch.idA || e.pointerId === this.pinch.idB)) this.pinch = null;
    if (this.drag?.id === e.pointerId) this.drag = null;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.mode !== "free") return;
    this.lastInput = performance.now();
    this.gaze = null;
    const gain = e.ctrlKey ? 2.4 : 0.6;
    this.wheelImpulse = clamp(this.wheelImpulse - e.deltaY * gain, -160, 260);
  };

  private onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t?.closest?.("button, a, input, textarea, [tabindex]")) return;
    this.lastInput = performance.now();
    if (e.type === "keydown") {
      if (e.key.startsWith("Arrow")) e.preventDefault();
      this.keys.add(e.key.toLowerCase());
    } else this.keys.delete(e.key.toLowerCase());
  };

  private bind(): void {
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerCancel);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onKey);
  }

  private unbind(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onKey);
  }

  private pick(sx: number, sy: number): void {
    let best: OrbitTarget | null = null;
    let bestScore = Infinity;
    for (const t of this.targets) {
      const p = this.project(v3(...t.pos));
      if (!p) continue;
      const rad = Math.max(26, p.scale * t.r * 1.5);
      const d = Math.hypot(p.x - sx, p.y - sy);
      if (d > rad) continue;
      const score = d / rad;
      if (score < bestScore) {
        best = t;
        bestScore = score;
      }
    }
    if (best) this.travelTo(best.id);
  }

  // ---------- camera math ----------

  private lookToward(target: V3): void {
    const d = sub(target, this.pos);
    const l = len(d) || 1;
    this.yaw = Math.atan2(d.x, d.z);
    this.pitch = Math.asin(clamp(d.y / l, -1, 1));
  }

  private forward(): V3 {
    return v3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
  }

  private updateTrig(): void {
    this.cyF = Math.cos(this.yaw);
    this.syF = Math.sin(this.yaw);
    this.cpF = Math.cos(this.pitch);
    this.spF = Math.sin(this.pitch);
  }

  private project(p: V3): { x: number; y: number; z: number; scale: number } | null {
    const dx = p.x - this.pos.x;
    const dy = p.y - this.pos.y;
    const dz = p.z - this.pos.z;
    const x1 = dx * this.cyF - dz * this.syF;
    const z1 = dx * this.syF + dz * this.cyF;
    const y2 = dy * this.cpF - z1 * this.spF;
    const z2 = dy * this.spF + z1 * this.cpF;
    if (z2 < NEAR) return null;
    const scale = this.f / z2;
    return { x: this.w / 2 + x1 * scale, y: this.h / 2 - y2 * scale, z: z2, scale };
  }

  private projectScratch(px: number, py: number, pz: number) {
    const dx = px - this.pos.x;
    const dy = py - this.pos.y;
    const dz = pz - this.pos.z;
    const x1 = dx * this.cyF - dz * this.syF;
    const z1 = dx * this.syF + dz * this.cyF;
    const y2 = dy * this.cpF - z1 * this.spF;
    const z2 = dy * this.spF + z1 * this.cpF;
    if (z2 < NEAR) return null;
    const scale = this.f / z2;
    const s = this.scratch;
    s.x = this.w / 2 + x1 * scale;
    s.y = this.h / 2 - y2 * scale;
    s.z = z2;
    s.scale = scale;
    return s;
  }

  // ---------- simulation ----------

  private enterOrbit(t: OrbitTarget): void {
    this.mode = "orbit";
    this.captured = t;
    this.wheelImpulse = 0;
    const tp = v3(...t.pos);
    const d = sub(this.pos, tp);
    this.orbitAngle = Math.atan2(d.x, d.z);
    this.orbitDist = Math.max(len(v3(d.x, 0, d.z)), t.r * 2.4);
    this.orbitY = clamp(d.y, -t.r * 1.2, t.r * 1.2);
    this.lookToward(tp);
    this.cb.onCapture(t.id);
  }

  private tick(now: number): void {
    const dt = clamp(now - this.last, 0, 50) / 1000;
    this.last = now;
    const t = (now - this.t0) / 1000;

    this.frameEma = this.frameEma * 0.95 + dt * 1000 * 0.05;
    if (this.frameEma > 26 && this.quality === 1) {
      this.quality = 0.5;
      this.stars = this.stars.filter((_, i) => i % 2 === 0);
      this.dust = this.dust.filter((_, i) => i % 2 === 0);
      this.dprCap = 1.2;
      this.resize();
      this.frameEma = 16;
    }

    if (this.mode === "free") this.freeFlight(dt);
    else if (this.mode === "autopilot") this.autopilot(now);
    else if (this.mode === "orbit") this.orbit(dt);

    this.render(t);
  }

  private freeFlight(dt: number): void {
    if (this.reducedMotion) return; // taps travel; no drift
    const now = performance.now();
    if (this.gaze) {
      const g = this.gaze;
      const u = easeInOut(clamp((now - g.t0) / g.dur, 0, 1));
      const d = sub(g.p, this.pos);
      const l = len(d) || 1;
      let wantYaw = Math.atan2(d.x, d.z);
      const wantPitch = Math.asin(clamp(d.y / l, -1, 1));
      while (wantYaw - g.yaw0 > Math.PI) wantYaw -= Math.PI * 2;
      while (wantYaw - g.yaw0 < -Math.PI) wantYaw += Math.PI * 2;
      this.yaw = g.yaw0 + (wantYaw - g.yaw0) * u;
      this.pitch = g.pitch0 + (wantPitch - g.pitch0) * u;
      if (u >= 1) this.gaze = null;
    }

    const lookX =
      (this.keys.has("arrowleft") ? -1 : 0) + (this.keys.has("arrowright") ? 1 : 0) + this.lookHeld.x;
    const lookY =
      (this.keys.has("arrowup") ? -1 : 0) + (this.keys.has("arrowdown") ? 1 : 0) + this.lookHeld.y;
    if (lookX !== 0 || lookY !== 0) {
      this.gaze = null;
      this.yaw += lookX * 1.1 * dt;
      this.pitch = clamp(this.pitch - lookY * 0.9 * dt, -1.35, 1.35);
    }

    // idle — the system carries the visitor toward the undiscovered
    let autoDrift = 0;
    if (!this.gaze && now - this.lastInput > 9000 && lookX === 0 && lookY === 0) {
      const next = this.nextDestination();
      if (next) {
        const d = sub(v3(...next.pos), this.pos);
        const l = len(d) || 1;
        let wantYaw = Math.atan2(d.x, d.z);
        const wantPitch = Math.asin(clamp(d.y / l, -1, 1));
        while (wantYaw - this.yaw > Math.PI) wantYaw -= Math.PI * 2;
        while (wantYaw - this.yaw < -Math.PI) wantYaw += Math.PI * 2;
        const turn = 0.35 * dt;
        this.yaw += clamp(wantYaw - this.yaw, -turn, turn);
        this.pitch = clamp(this.pitch + clamp(wantPitch - this.pitch, -turn, turn), -1.35, 1.35);
        autoDrift = 26;
      }
    }

    const thrustKey = this.keys.has("w") || this.keys.has(" ");
    const brakeKey = this.keys.has("s");
    const targetSpeed =
      CRUISE + autoDrift + (thrustKey ? THRUST_MAX : 0) + this.wheelImpulse - (brakeKey ? CRUISE + 40 : 0);
    this.wheelImpulse *= Math.pow(0.2, dt);
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 2.2);
    const fwd = this.forward();
    this.pos.x += fwd.x * this.speed * dt;
    this.pos.y += fwd.y * this.speed * dt;
    this.pos.z += fwd.z * this.speed * dt;

    if (this.escape) {
      this.pos.x += this.escape.dir.x * 62 * dt;
      this.pos.y += this.escape.dir.y * 62 * dt;
      this.pos.z += this.escape.dir.z * 62 * dt;
      const from = this.targets.find((x) => x.id === this.escape!.id);
      const clear = !from || len(sub(v3(...from.pos), this.pos)) > from.r * CAPTURE_FACTOR;
      if (performance.now() > this.escape.until && clear) this.escape = null;
    }

    // gravity — every body pulls; close enough and it captures
    for (const tg of this.targets) {
      if (this.escape && tg.id === this.escape.id) continue;
      const tp = v3(...tg.pos);
      const d = sub(tp, this.pos);
      const dist = len(d);
      if (dist < tg.r * CAPTURE_FACTOR) {
        this.enterOrbit(tg);
        return;
      }
      const range = tg.r * GRAVITY_RANGE;
      if (dist < range) {
        const g = 26 * (1 - dist / range);
        const n = norm(d);
        this.pos.x += n.x * g * dt;
        this.pos.y += n.y * g * dt;
        this.pos.z += n.z * g * dt;
      }
    }

    const r = len(this.pos);
    if (r > BOUND) {
      const n = norm(this.pos);
      const push = (r - BOUND) * 0.9 * dt;
      this.pos.x -= n.x * push;
      this.pos.y -= n.y * push;
      this.pos.z -= n.z * push;
    }
  }

  private autopilot(now: number): void {
    const u = easeInOut(clamp((now - this.apStart) / this.apDur, 0, 1));
    this.pos = lerp3(this.apFrom, this.apTo, u);
    if (this.apLook0) {
      const d = sub(this.apTarget, this.pos);
      const l = len(d) || 1;
      const wantYaw = Math.atan2(d.x, d.z);
      const wantPitch = Math.asin(clamp(d.y / l, -1, 1));
      let dyaw = wantYaw - this.apLook0.yaw;
      while (dyaw > Math.PI) dyaw -= Math.PI * 2;
      while (dyaw < -Math.PI) dyaw += Math.PI * 2;
      const g = easeInOut(clamp(u * 1.5, 0, 1));
      this.yaw = this.apLook0.yaw + dyaw * g;
      this.pitch = this.apLook0.pitch + (wantPitch - this.apLook0.pitch) * g;
    }
    if (u >= 1 && this.captured) this.enterOrbit(this.captured);
  }

  private orbit(dt: number): void {
    const t = this.captured;
    if (!t) {
      this.mode = "free";
      return;
    }
    if (!this.reducedMotion) this.orbitAngle += dt * 0.05;
    const tp = v3(...t.pos);
    this.pos = v3(
      tp.x + Math.sin(this.orbitAngle) * this.orbitDist,
      tp.y + this.orbitY,
      tp.z + Math.cos(this.orbitAngle) * this.orbitDist
    );
    this.lookToward(tp);
  }

  // ---------- scene ----------

  private seedSky(): void {
    this.stars = Array.from({ length: STAR_COUNT }, () => {
      const u = Math.random() * 2 - 1;
      const ph = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      return {
        p: v3(Math.cos(ph) * s * SKY_R, u * SKY_R, Math.sin(ph) * s * SKY_R),
        m: 0.2 + Math.pow(Math.random(), 2.2) * 0.8,
        warm: Math.random() < 0.12,
        tw: Math.random() * Math.PI * 2,
      };
    });
    this.dust = Array.from({ length: DUST_COUNT }, () =>
      v3((Math.random() * 2 - 1) * 750, (Math.random() * 2 - 1) * 600, (Math.random() * 2 - 1) * 750)
    );
  }

  private render(t: number): void {
    const { ctx, w, h } = this;
    this.updateTrig();
    ctx.fillStyle = "#04060b";
    ctx.fillRect(0, 0, w, h);

    for (const s of this.stars) {
      const p = this.projectScratch(s.p.x, s.p.y, s.p.z);
      if (!p || p.x < -3 || p.x > w + 3 || p.y < -3 || p.y > h + 3) continue;
      const twinkle = this.reducedMotion ? 1 : 0.75 + 0.25 * Math.sin(t * 1.2 + s.tw);
      ctx.globalAlpha = s.m * twinkle * 0.9;
      ctx.fillStyle = s.warm ? "#e8dcb0" : "#cdd8ec";
      const sz = s.m > 0.75 ? 1.8 : 1.1;
      ctx.fillRect(p.x, p.y, sz, sz);
    }

    ctx.fillStyle = "#8fa3bf";
    for (const d of this.dust) {
      const p = this.projectScratch(d.x, d.y, d.z);
      if (!p || p.x < -3 || p.x > w + 3 || p.y < -3 || p.y > h + 3) continue;
      ctx.globalAlpha = clamp(60 / p.z, 0.03, 0.3);
      ctx.fillRect(p.x, p.y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // threads: core ↔ worlds, core ↔ gate
    const core = this.targets.find((x) => x.kind === "core");
    if (core) {
      for (const tg of this.targets) {
        if (tg.kind === "world") this.drawThread(v3(...core.pos), v3(...tg.pos), tg.color, t);
        if (tg.kind === "gate") this.drawThread(v3(...core.pos), v3(...tg.pos), "#d8c98a", t);
      }
    }

    // bodies, far → near
    const order = this.targets
      .map((tg) => ({ tg, p: this.project(v3(...tg.pos)) }))
      .filter((o) => o.p !== null)
      .sort((a, b) => b.p!.z - a.p!.z);

    for (const { tg, p } of order) {
      const sr = Math.min(p!.scale * tg.r, Math.max(w, h) * 0.7);
      const nearFade = clamp((p!.z - NEAR) / (tg.r * 1.1), 0, 1);
      const alpha = clamp(2.2 - p!.z / 900, 0.35, 1) * nearFade;
      if (tg.kind === "world") {
        paintAppWorld(ctx, tg.worldKind ?? "clock", tg.color, p!.x, p!.y, sr, t, {
          alpha,
          visited: tg.visited,
          seed: tg.id.length + tg.id.charCodeAt(0),
        });
      } else if (tg.kind === "core") {
        paintCore(ctx, p!.x, p!.y, sr, t, alpha, this.reducedMotion);
      } else {
        paintGate(ctx, p!.x, p!.y, sr, t, alpha, !!tg.cue, this.reducedMotion);
      }
      if (tg.cue) {
        const ph = this.reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.6);
        const cr = Math.max(sr, 5) * (1.7 + ph * 0.5);
        ctx.beginPath();
        ctx.arc(p!.x, p!.y, cr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(tg.color, 0.14 + ph * 0.38);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      if (p!.z < 640 && sr > 7) {
        this.paintLabel(p!.x, p!.y + sr * 2.1 + 14, tg.title, tg.subtitle, tg.color, clamp(1.4 - p!.z / 520, 0, 0.95));
      }
    }

    ctx.globalAlpha = 1;
    if (this.vignette) {
      ctx.fillStyle = this.vignette;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawThread(a: V3, b: V3, color: string, t: number): void {
    const pa = this.project(a);
    const pb = this.project(b);
    if (!pa || !pb) return;
    const { ctx } = this;
    ctx.strokeStyle = rgba(color, 0.15);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
    if (!this.reducedMotion) {
      const u = (t * 0.12 + (a.x + b.z) * 0.001) % 1;
      const p = this.project(lerp3(a, b, u));
      if (p) {
        ctx.globalAlpha = 0.7;
        const sz = Math.max(6, p.scale * 3);
        ctx.drawImage(glowSprite(color), p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.globalAlpha = 1;
      }
    }
  }

  private paintLabel(x: number, y: number, title: string, subtitle: string | undefined, color: string, alpha: number): void {
    if (alpha <= 0.02) return;
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    if (subtitle) {
      ctx.font = "9px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = rgba(color, 0.75);
      ctx.fillText(subtitle.toUpperCase().split("").join("  "), x, y);
      y += 15;
    }
    ctx.font = "13px Georgia, serif";
    ctx.fillStyle = "rgba(201,209,221,0.92)";
    ctx.fillText(title, x, y);
    ctx.restore();
  }
}
