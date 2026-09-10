import type { Season } from "./clockMath";

/** Anchor points on real solstices/equinoxes (approximate, Northern hemisphere). */
export const SEASON_ANCHORS: Record<Season, number> = {
  spring: 80, // ~Mar 21 equinox
  summer: 172, // ~Jun 21 solstice
  autumn: 266, // ~Sep 23 equinox
  winter: 356, // ~Dec 21 solstice
};

const YEAR_LENGTH = 365;
const HALF_YEAR = YEAR_LENGTH / 2;

export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff =
    date.getTime() -
    start.getTime() -
    (date.getTimezoneOffset() - start.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86_400_000);
}

function circularDistance(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, YEAR_LENGTH - d);
}

/** Raised-cosine bump: 1 at the anchor, 0.5 at a neighbouring anchor (~91 days), 0 at the opposite anchor. */
function seasonKernel(distance: number): number {
  if (distance >= HALF_YEAR) return 0;
  return (Math.cos((distance / HALF_YEAR) * Math.PI) + 1) / 2;
}

/** Continuous per-season blend weights (sum to 1) for a given date. */
export function getSeasonWeights(date: Date): Record<Season, number> {
  const day = dayOfYear(date);
  const raw = Object.fromEntries(
    (Object.entries(SEASON_ANCHORS) as [Season, number][]).map(
      ([season, anchor]) => [season, seasonKernel(circularDistance(day, anchor))],
    ),
  ) as Record<Season, number>;

  const total = Object.values(raw).reduce((sum, w) => sum + w, 0) || 1;
  return Object.fromEntries(
    (Object.entries(raw) as [Season, number][]).map(([season, w]) => [
      season,
      w / total,
    ]),
  ) as Record<Season, number>;
}

export function dominantSeason(weights: Record<Season, number>): Season {
  return (Object.entries(weights) as [Season, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}

// --- colour interpolation -------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function blendColors(
  weights: Record<Season, number>,
  colorsBySeason: Record<Season, string>,
): string {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const season of Object.keys(weights) as Season[]) {
    const [cr, cg, cb] = hexToRgb(colorsBySeason[season]);
    const w = weights[season];
    r += cr * w;
    g += cg * w;
    b += cb * w;
  }
  return rgbToHex([r, g, b]);
}

/** Linear-interpolate between two hex colours, t in [0,1]. Used for day/night twilight blending. */
export function mixHex(a: string, b: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([
    ar + (br - ar) * clamped,
    ag + (bg - ag) * clamped,
    ab + (bb - ab) * clamped,
  ]);
}
