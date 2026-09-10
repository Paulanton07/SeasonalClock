// A deliberately simplified stand-in for real orbital mechanics.
//
// Real Earth eccentricity is ~0.0167 (nearly circular) and finding the exact
// position requires iteratively solving Kepler's equation. For this widget we
// fake both: the eccentricity is visually exaggerated so the ellipse actually
// reads as an ellipse, and the "faster near the Sun, slower far away" motion
// uses a cheap closed-form approximation (the classic first-order
// "equation of center") instead of Newton-Raphson root finding. It looks and
// behaves right without the numerical-methods overhead.

export const VISUAL_ECCENTRICITY = 0.35; // real Earth value is ~0.0167
export const ORBIT_PERIOD_DAYS = 365.25;
export const PERIHELION_DAY = 3; // ~Jan 3, closest approach
export const APHELION_DAY = 187; // ~Jul 6, farthest point
export const ORBIT_ROTATION_DEG = 90; // screen orientation: perihelion points "down"

/** Fractional day-of-year (integer day + time-of-day fraction) used for smooth animation. */
export function fractionalDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const msPerDay = 86_400_000;
  return (date.getTime() - start.getTime()) / msPerDay;
}

export function dateFromDayOfYear(day: number, referenceYear: number): Date {
  const start = new Date(referenceYear, 0, 1).getTime();
  return new Date(start + day * 86_400_000);
}

function normalizeAngle(angle: number): number {
  const twoPi = 2 * Math.PI;
  const wrapped = angle % twoPi;
  return wrapped < 0 ? wrapped + twoPi : wrapped;
}

function meanAnomalyForDay(day: number): number {
  return ((day - PERIHELION_DAY) / ORBIT_PERIOD_DAYS) * 2 * Math.PI;
}

/** Faked true anomaly via the first-order equation of center (no Kepler solving). */
function approxTrueAnomaly(meanAnomaly: number, e: number): number {
  return meanAnomaly + 2 * e * Math.sin(meanAnomaly);
}

/** Faked radius — close enough to look right without solving for eccentric anomaly exactly. */
function approxRadius(meanAnomaly: number, semiMajorAxis: number, e: number): number {
  return semiMajorAxis * (1 - e * Math.cos(meanAnomaly));
}

export function minOrbitRadius(semiMajorAxis: number, e: number = VISUAL_ECCENTRICITY): number {
  return semiMajorAxis * (1 - e);
}

export function maxOrbitRadius(semiMajorAxis: number, e: number = VISUAL_ECCENTRICITY): number {
  return semiMajorAxis * (1 + e);
}

export interface OrbitPoint {
  x: number;
  y: number;
  radius: number;
}

export function orbitPositionForDay(
  day: number,
  semiMajorAxis: number,
  e: number = VISUAL_ECCENTRICITY,
  rotationDeg = ORBIT_ROTATION_DEG,
): OrbitPoint {
  const M = meanAnomalyForDay(day);
  const nu = approxTrueAnomaly(M, e);
  const radius = approxRadius(M, semiMajorAxis, e);
  const angle = nu + (rotationDeg * Math.PI) / 180;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), radius };
}

/**
 * Inverse of orbitPositionForDay: given a screen-space angle (radians, atan2
 * convention) around the sun's focus, returns the day-of-year that would
 * place the Earth marker there. Uses the algebraic first-order inverse of
 * the same "faked" equation of center, so dragging the marker stays
 * consistent with how it's drawn.
 */
export function dayForScreenAngle(
  screenAngleRad: number,
  e: number = VISUAL_ECCENTRICITY,
  rotationDeg = ORBIT_ROTATION_DEG,
): number {
  const nu = screenAngleRad - (rotationDeg * Math.PI) / 180;
  const M = nu - 2 * e * Math.sin(nu);
  const day = PERIHELION_DAY + (normalizeAngle(M) / (2 * Math.PI)) * ORBIT_PERIOD_DAYS;
  return day % ORBIT_PERIOD_DAYS;
}

/** Samples the faked ellipse for drawing the static orbit path. */
export function orbitPathPoints(
  semiMajorAxis: number,
  e: number = VISUAL_ECCENTRICITY,
  rotationDeg = ORBIT_ROTATION_DEG,
  steps = 96,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const M = (i / steps) * 2 * Math.PI;
    const nu = approxTrueAnomaly(M, e);
    const radius = approxRadius(M, semiMajorAxis, e);
    const angle = nu + (rotationDeg * Math.PI) / 180;
    points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
  }
  return points;
}
