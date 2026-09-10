// Deterministic "random" scenery layout so clouds/stars/leaves/snow sit in
// stable positions across renders instead of jumping around every tick.

interface DecorPoint {
  id: number;
  x: number;
  y: number;
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

function makePoints(
  count: number,
  seed: number,
  xRange: [number, number],
  yRange: [number, number],
): DecorPoint[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: xRange[0] + random() * (xRange[1] - xRange[0]),
    y: yRange[0] + random() * (yRange[1] - yRange[0]),
    scale: 0.6 + random() * 0.8,
    phase: random() * Math.PI * 2,
  }));
}

// Layout ranges match the taller card: sky spans y 0–480, soil spans y 480–640.
export const CLOUD_LAYOUT = makePoints(5, 11, [30, 370], [40, 290]);
export const STAR_LAYOUT = makePoints(55, 22, [10, 390], [10, 460]);
export const SNOW_LAYOUT = makePoints(14, 33, [20, 380], [490, 630]);
export const LEAF_LAYOUT = makePoints(9, 44, [20, 380], [488, 625]);
export const FLOWER_LAYOUT = makePoints(11, 55, [25, 375], [483, 498]);
export const ROCK_LAYOUT = makePoints(7, 66, [20, 380], [495, 635]);
export const FURROW_LAYOUT = makePoints(4, 77, [0, 0], [495, 630]);
