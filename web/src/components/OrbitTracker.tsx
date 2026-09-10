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
    <div className="w-full max-w-sm rounded-2xl bg-slate-900/80 p-4 text-white shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
          Earth&apos;s Orbit (stylised)
        </h3>
        {isExploring && (
          <button
            type="button"
            onClick={() => setPreviewDay(null)}
            className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] hover:bg-white/20"
          >
            Back to now
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`-${VIEW_HALF} -${VIEW_HALF} ${VIEW_HALF * 2} ${VIEW_HALF * 2}`}
        className="mx-auto h-40 w-40 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <path d={orbitPath} fill="none" stroke="#7dd3fc" strokeOpacity={0.45} strokeWidth={1.5} />

        {/* Sun sits at the ellipse's focus, not the centre */}
        <circle cx={0} cy={0} r={9} fill="#ffd23f" />
        <circle cx={0} cy={0} r={14} fill="#ffd23f" opacity={0.25} />

        {seasonPoints.map(({ season: s, color, point }) => (
          <circle
            key={s}
            cx={point.x}
            cy={point.y}
            r={3.5}
            fill={color}
            stroke="#0f172a"
            strokeWidth={0.75}
          />
        ))}

        <g>
          <circle cx={periPos.x} cy={periPos.y} r={2.5} fill="#ffffff" />
          <title>Closest approach (~Jan 3, Northern winter)</title>
        </g>
        <g>
          <circle cx={apheliaPos.x} cy={apheliaPos.y} r={2.5} fill="#ffffff" />
          <title>Farthest point (~Jul 6, Northern summer)</title>
        </g>

        {/* Larger invisible hit target makes the marker easy to grab */}
        <circle cx={earthPos.x} cy={earthPos.y} r={14} fill="transparent" />
        <circle
          cx={earthPos.x}
          cy={earthPos.y}
          r={6}
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      </svg>

      <p className="mt-1 text-center text-[10px] text-white/50">
        Drag the blue dot to explore any day of the year.
      </p>

      <div className="mt-3 rounded-xl bg-black/30 p-3 text-xs leading-relaxed text-white/80">
        <p>
          <span className="font-semibold text-white">{dateLabel}</span> —{" "}
          {SEASON_PALETTES[season].label} (Northern hemisphere)
        </p>
        <p className="mt-1">Earth is {distanceLabel} at this point in its orbit.</p>
        {!isExploring && (
          <p className="mt-1 text-white/50">Showing the live position — drag the dot to explore.</p>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] leading-snug text-white/70">
        Earth is actually closest to the Sun in January and farthest in July —
        axial tilt drives the seasons, not distance. Shape and speed here are
        stylised for legibility, not to scale.
      </p>
    </div>
  );
}
