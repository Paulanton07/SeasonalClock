import { useMemo, useRef, useState, type PointerEvent } from "react";
import {
  APHELION_DAY,
  PERIHELION_DAY,
  VISUAL_ECCENTRICITY,
  dateFromDayOfYear,
  dayForScreenAngle,
  fractionalDayOfYear,
  maxOrbitRadius,
  minOrbitRadius,
  orbitPathPoints,
  orbitPositionForDay,
} from "../lib/orbit";
import { SEASON_ANCHORS, dominantSeason, getSeasonWeights } from "../lib/seasonBlend";
import { SEASON_PALETTES } from "../lib/seasonPalette";
import type { Season } from "../lib/clockMath";

const A = 60; // semi-major axis, viewBox units
const VIEW_HALF = 100;

interface Props {
  now: Date;
}

export default function OrbitTracker({ now }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [previewDay, setPreviewDay] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const liveDay = fractionalDayOfYear(now);
  const displayDay = previewDay ?? liveDay;
  const isExploring = previewDay !== null;

  const orbitPath = useMemo(() => {
    const points = orbitPathPoints(A, VISUAL_ECCENTRICITY);
    return (
      points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") +
      " Z"
    );
  }, []);

  const earthPos = orbitPositionForDay(displayDay, A);
  const periPos = orbitPositionForDay(PERIHELION_DAY, A);
  const apheliaPos = orbitPositionForDay(APHELION_DAY, A);

  const seasonPoints = (Object.entries(SEASON_ANCHORS) as [Season, number][]).map(
    ([season, anchorDay]) => ({
      season,
      color: SEASON_PALETTES[season].grass,
      point: orbitPositionForDay(anchorDay, A),
    }),
  );

  const previewDate = dateFromDayOfYear(displayDay, now.getFullYear());
  const weights = getSeasonWeights(previewDate);
  const season = dominantSeason(weights);
  const dateLabel = previewDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const minRadius = minOrbitRadius(A);
  const maxRadius = maxOrbitRadius(A);
  const distancePct = (earthPos.radius - minRadius) / (maxRadius - minRadius);
  const distanceLabel =
    distancePct < 0.15
      ? "near its closest approach to the Sun (perihelion)"
      : distancePct > 0.85
        ? "near its farthest point from the Sun (aphelion)"
        : "roughly midway between its closest and farthest points";

  function updateFromPointer(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * VIEW_HALF * 2 - VIEW_HALF;
    const localY = ((clientY - rect.top) / rect.height) * VIEW_HALF * 2 - VIEW_HALF;
    const angle = Math.atan2(localY, localX);
    setPreviewDay(dayForScreenAngle(angle));
  }

  function handlePointerDown(e: PointerEvent<SVGSVGElement>) {
    svgRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  }
  function handlePointerMove(e: PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY);
  }
  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 pt-16 sm:pt-20 select-none overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/85 p-5 sm:p-6 text-white shadow-2xl border border-white/10 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-sky-400">
              Earth&apos;s Annual Orbit
            </h3>
            <p className="text-[11px] text-white/50">Elliptical path & seasonal solstices</p>
          </div>
          {isExploring && (
            <button
              type="button"
              onClick={() => setPreviewDay(null)}
              className="rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 px-3 py-1 text-xs text-sky-200 transition"
            >
              Back to Today
            </button>
          )}
        </div>

        <div className="relative my-2 flex justify-center">
          <svg
            ref={svgRef}
            viewBox={`-${VIEW_HALF} -${VIEW_HALF} ${VIEW_HALF * 2} ${VIEW_HALF * 2}`}
            className="h-60 w-60 sm:h-72 sm:w-72 md:h-80 md:w-80 touch-none cursor-grab active:cursor-grabbing drop-shadow-[0_0_25px_rgba(56,189,248,0.15)]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Orbit track */}
            <path
              d={orbitPath}
              fill="none"
              stroke="#7dd3fc"
              strokeOpacity={0.4}
              strokeWidth={1.75}
            />

            {/* Sun at the ellipse focus */}
            <circle cx={0} cy={0} r={18} fill="#ffd23f" opacity={0.2} />
            <circle cx={0} cy={0} r={11} fill="#ffd23f" />

            {/* Season anchor dots */}
            {seasonPoints.map(({ season: s, color, point }) => (
              <circle
                key={s}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                stroke="#0f172a"
                strokeWidth={1}
              />
            ))}

            {/* Perihelion & Aphelion markers */}
            <g>
              <circle cx={periPos.x} cy={periPos.y} r={3} fill="#ffffff" />
              <title>Closest approach (~Jan 3, Perihelion)</title>
            </g>
            <g>
              <circle cx={apheliaPos.x} cy={apheliaPos.y} r={3} fill="#ffffff" />
              <title>Farthest point (~Jul 6, Aphelion)</title>
            </g>

            {/* Earth interactive draggable marker */}
            <circle cx={earthPos.x} cy={earthPos.y} r={18} fill="transparent" />
            <circle
              cx={earthPos.x}
              cy={earthPos.y}
              r={12}
              fill="#38bdf8"
              opacity={0.3}
            />
            <circle
              cx={earthPos.x}
              cy={earthPos.y}
              r={7}
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </svg>
        </div>

        <p className="text-center text-xs text-sky-300/80 font-medium">
          Drag the blue Earth dot along the orbit to explore any day.
        </p>

        <div className="mt-4 rounded-2xl bg-black/40 p-3.5 text-xs leading-relaxed text-white/90 border border-white/10">
          <p className="text-sm font-semibold text-white">
            {dateLabel} — <span className="text-amber-300">{SEASON_PALETTES[season].label}</span>
          </p>
          <p className="mt-1 text-white/80">Earth is {distanceLabel}.</p>
          {!isExploring && (
            <p className="mt-1 text-[11px] text-white/50">Live real-time position.</p>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] leading-snug text-white/60">
          Note: Earth is closest to the Sun in January and farthest in July.
          Axial tilt (23.5°) drives the seasons, not orbital distance.
        </p>
      </div>
    </div>
  );
}
