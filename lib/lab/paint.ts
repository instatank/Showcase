// Shared canvas paint helpers for the Lab engines.
// Glow is pre-rendered to sprite canvases once — per-frame gradients and
// shadowBlur are too expensive inside a render loop (UoT lesson).

export function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const sprites = new Map<string, HTMLCanvasElement>();

export function glowSprite(color: string): HTMLCanvasElement {
  let s = sprites.get(color);
  if (s) return s;
  const SIZE = 256;
  s = document.createElement("canvas");
  s.width = SIZE;
  s.height = SIZE;
  const c = s.getContext("2d")!;
  const g = c.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  g.addColorStop(0, rgba(color, 0.85));
  g.addColorStop(0.25, rgba(color, 0.32));
  g.addColorStop(0.6, rgba(color, 0.08));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, SIZE, SIZE);
  sprites.set(color, s);
  return s;
}

/** Deterministic 0..1 jitter series — per-world shape variation. */
export function jitter(seed: number, i: number): number {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
