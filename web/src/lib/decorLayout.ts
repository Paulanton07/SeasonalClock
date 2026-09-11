import { FLOWER_PALETTES } from "./seasonPalette";

// Deterministic scenery layout using normalized (0..1) coordinates so
// clouds, stars, flora, and soil textures dynamically fill any screen size
// (mobile portrait, desktop widescreen, tablet) in stable positions.

export interface NormalizedDecorPoint {
  id: number;
  xPct: number; // 0..1
  yPct: number; // 0..1
  scale: number;
  phase: number;
}

function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNormalizedPoints(
  count: number,
  seed: number,
  xRange: [number, number],
  yRange: [number, number],
): NormalizedDecorPoint[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, id) => ({
    id,
    xPct: xRange[0] + random() * (xRange[1] - xRange[0]),
    yPct: yRange[0] + random() * (yRange[1] - yRange[0]),
    scale: 0.7 + random() * 0.7,
    phase: random() * Math.PI * 2,
  }));
}

// Sky elements: yPct 0..1 maps to sky region (y: 20 to horizon - 30)
export const CLOUD_LAYOUT = makeNormalizedPoints(8, 11, [0.04, 0.94], [0.08, 0.75]);
export const STAR_LAYOUT = makeNormalizedPoints(85, 22, [0.01, 0.99], [0.03, 0.92]);

// Ground elements: yPct 0..1 maps to soil region (y: horizon + 15 to height - 20)
export const SNOW_LAYOUT = makeNormalizedPoints(26, 33, [0.02, 0.98], [0.05, 0.92]);
export const LEAF_LAYOUT = makeNormalizedPoints(18, 44, [0.02, 0.98], [0.06, 0.90]);
export const FLOWER_LAYOUT = makeNormalizedPoints(26, 55, [0.02, 0.98], [0.1, 0.9]);
export const ROCK_LAYOUT = makeNormalizedPoints(14, 66, [0.03, 0.97], [0.12, 0.88]);
export const FURROW_DEPTHS = [0.18, 0.38, 0.58, 0.76, 0.92];

export type FlowerColorType = keyof typeof FLOWER_PALETTES | string;

export interface MeadowFlower {
  id: number;
  xPct: number; // 0..1 across screen width
  colorType: FlowerColorType;
  stemHeight: number; // stem height in pixels
  stemLean: number; // horizontal lean in pixels
  scale: number; // blossom size scaling
  phase: number; // wind sway phase
}

export function makeMeadowFlowers(count = 45, seed = 77): MeadowFlower[] {
  const random = mulberry32(seed);
  const availableColors = Object.keys(FLOWER_PALETTES);
  return Array.from({ length: count }, (_, id) => {
    // Semi-regular spacing across horizon with organic natural jitter
    const basePct = (id + 0.2 + random() * 0.6) / count;
    // Cycling color distribution with organic variation across all available flower colors
    const colorType =
      availableColors[
        (id + Math.floor(random() * availableColors.length)) % availableColors.length
      ];
    return {
      id,
      xPct: Math.min(0.985, Math.max(0.015, basePct)),
      colorType,
      stemHeight: 10 + random() * 15, // 10px to 25px
      stemLean: (random() - 0.5) * 6, // -3px to +3px
      scale: 0.85 + random() * 0.4, // 0.85 to 1.25 scale
      phase: random() * Math.PI * 2,
    };
  });
}

export const MEADOW_FLOWERS = makeMeadowFlowers(45, 88);

