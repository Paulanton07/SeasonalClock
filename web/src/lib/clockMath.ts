// Mathematical coordinate mapping for the anticlockwise seasonal clock.
// See docs/seasonal clock.txt section 3 for the original specification.

/** Hours elapsed since noon (0 at 12pm, 24 at the following 12pm). */
export function hoursSinceNoon(date: Date): number {
  const hours =
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  return (hours - 12 + 24) % 24;
}

/**
 * Angle (degrees, screen/canvas convention where the Y axis points down) for
 * a given number of hours since noon. 12pm maps to -90° (top dead centre);
 * the angle decreases as time increases, producing an anticlockwise sweep.
 */
export function angleForHoursSinceNoon(hours: number): number {
  return -90 - hours * 15; // 360deg / 24h = 15deg per hour
}

export function angleForDate(date: Date): number {
  return angleForHoursSinceNoon(hoursSinceNoon(date));
}

export interface Point {
  x: number;
  y: number;
}

export function pointOnCircle(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/** True when the given time falls between 6pm and 6am (below the horizon). */
export function isNight(date: Date): boolean {
  const t = hoursSinceNoon(date);
  return t > 6 && t < 18;
}

export type Season = "spring" | "summer" | "autumn" | "winter";

/** Simple Northern-hemisphere month-based season lookup (placeholder). */
export function seasonForDate(date: Date): Season {
  const month = date.getMonth(); // 0 = Jan
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function formatDigitalTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const period = hours < 12 ? "AM" : "PM";
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Classic smoothstep — used to fade day/night and season effects gradually instead of snapping. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
