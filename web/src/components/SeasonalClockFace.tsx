import { useMemo, useState } from "react";
import type { Reminder } from "../types";
import {
  angleForDate,
  pointOnCircle,
  smoothstep,
  type Season,
} from "../lib/clockMath";
import { getSeasonWeights, blendColors, mixHex } from "../lib/seasonBlend";
import {
  NIGHT_SKY,
  SEASON_PALETTES,
  SUN_DAY_COLOR,
  SUN_NIGHT_COLOR,
} from "../lib/seasonPalette";
import {
  CLOUD_LAYOUT,
  FLOWER_LAYOUT,
  FURROW_LAYOUT,
  LEAF_LAYOUT,
  ROCK_LAYOUT,
  SNOW_LAYOUT,
  STAR_LAYOUT,
} from "../lib/decorLayout";
import ReminderPopover from "./ReminderPopover";

const VIEW_W = 400;
const VIEW_H = 640; // taller-than-wide card: room for a big dial + thin soil + open sky
const CENTER_X = VIEW_W / 2;
// Horizon sits well below the frame's vertical middle, with a generous open-sky
// margin above the dial, so the soil band stays a thin strip while the dial
// itself stays large (not shrunk to fit).
const TRACK_RADIUS = 160;
const HORIZON_Y = VIEW_H - TRACK_RADIUS; // circle's bottom (midnight) touches the frame's bottom
const SUN_RADIUS = 18;
const DOT_RADIUS = 8;
const HIT_RADIUS = 18;
const TWILIGHT_BAND = 30; // viewBox units either side of the horizon

const HOUR_MARKERS = [
  { hoursSinceNoon: 0, label: "12PM" },
  { hoursSinceNoon: 3, label: "3PM" },
  { hoursSinceNoon: 6, label: "6PM" },
  { hoursSinceNoon: 9, label: "9PM" },
  { hoursSinceNoon: 12, label: "12AM" },
  { hoursSinceNoon: 15, label: "3AM" },
  { hoursSinceNoon: 18, label: "6AM" },
  { hoursSinceNoon: 21, label: "9AM" },
];

function zigzagGrassPath(
  width: number,
  y: number,
  teeth: number,
  height: number,
  xOffset = 0,
) {
  const step = width / teeth;
  let d = `M${xOffset},${y}`;
  for (let i = 0; i < teeth; i++) {
    const midX = xOffset + i * step + step / 2;
    const endX = xOffset + (i + 1) * step;
    d += ` L${midX},${y - height} L${endX},${y}`;
  }
  return d;
}

/** Pulls one colour field out of every season's palette, keyed for blendColors(). */
function paletteChannel(field: keyof (typeof SEASON_PALETTES)["spring"]) {
  return Object.fromEntries(
    (Object.keys(SEASON_PALETTES) as Season[]).map((s) => [s, SEASON_PALETTES[s][field]]),
  ) as Record<Season, string>;
}

interface Props {
  now: Date;
  reminders: Reminder[];
}

export default function SeasonalClockFace({ now, reminders }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const weights = useMemo(() => getSeasonWeights(now), [now]);

  const sunPoint = useMemo(
    () => pointOnCircle(CENTER_X, HORIZON_Y, TRACK_RADIUS, angleForDate(now)),
    [now],
  );

  // Continuous 0..1 night factor with a soft twilight fade around the horizon,
  // instead of the scene snapping instantly at 6am/6pm.
  const nightFactor = smoothstep(-TWILIGHT_BAND, TWILIGHT_BAND, sunPoint.y - HORIZON_Y);

  const daySkyTop = useMemo(() => blendColors(weights, paletteChannel("skyTop")), [weights]);
  const daySkyBottom = useMemo(() => blendColors(weights, paletteChannel("skyBottom")), [weights]);
  const earthTop = useMemo(() => blendColors(weights, paletteChannel("earthTop")), [weights]);
  const earthBottom = useMemo(() => blendColors(weights, paletteChannel("earthBottom")), [weights]);
  const grassColor = useMemo(() => blendColors(weights, paletteChannel("grass")), [weights]);
  const cloudColor = useMemo(() => blendColors(weights, paletteChannel("cloud")), [weights]);

  const skyTop = mixHex(daySkyTop, NIGHT_SKY.top, nightFactor);
  const skyBottom = mixHex(daySkyBottom, NIGHT_SKY.bottom, nightFactor);
  const earthTopFinal = mixHex(earthTop, "#161a24", nightFactor * 0.75);
  const earthBottomFinal = mixHex(earthBottom, "#0c0e14", nightFactor * 0.75);
  const grassFinal = mixHex(grassColor, "#123018", nightFactor * 0.7);
  const grassFrontBase = mixHex(grassColor, "#0d2410", 0.5);
  const grassFrontFinal = mixHex(grassFrontBase, "#081a0c", nightFactor * 0.7);
  const sunColor = mixHex(SUN_DAY_COLOR, SUN_NIGHT_COLOR, nightFactor);

  const dayFactor = 1 - nightFactor;
  const winterWeight = weights.winter;
  const autumnWeight = weights.autumn;
  const springWeight = weights.spring;

  const reminderPoints = useMemo(
    () =>
      reminders.map((r) => {
        const point = pointOnCircle(
          CENTER_X,
          HORIZON_Y,
          TRACK_RADIUS,
          angleForDate(new Date(r.eventTime)),
        );
        return { reminder: r, point };
      }),
    [reminders],
  );

  const selected = reminderPoints.find((r) => r.reminder.id === selectedId);
  const timeMs = now.getTime();

  return (
    <div className="relative mx-auto h-full max-w-full aspect-[5/8] rounded-[2rem] overflow-hidden shadow-2xl border border-black/20 select-none">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBottom} />
          </linearGradient>
          <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={earthTopFinal} />
            <stop offset="100%" stopColor={earthBottomFinal} />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sunColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={sunColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky (upper half) */}
        <rect x={0} y={0} width={VIEW_W} height={HORIZON_Y} fill="url(#sky)" />

        {/* Stars fade in as night falls */}
        <g opacity={nightFactor}>
          {STAR_LAYOUT.map((star) => {
            const twinkle = 0.5 + 0.5 * Math.sin(timeMs / 900 + star.phase);
            return (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={0.8 * star.scale}
                fill="#ffffff"
                opacity={0.3 + 0.5 * twinkle}
              />
            );
          })}
        </g>

        {/* Clouds fade out as night falls */}
        <g opacity={dayFactor * 0.85}>
          {CLOUD_LAYOUT.map((cloud) => {
            const drift = Math.sin(timeMs / 40000 + cloud.phase) * 8;
            const cx = cloud.x + drift;
            return (
              <g key={cloud.id} opacity={0.8}>
                <ellipse cx={cx} cy={cloud.y} rx={26 * cloud.scale} ry={10 * cloud.scale} fill={cloudColor} />
                <ellipse
                  cx={cx + 16 * cloud.scale}
                  cy={cloud.y + 3}
                  rx={16 * cloud.scale}
                  ry={8 * cloud.scale}
                  fill={cloudColor}
                />
                <ellipse
                  cx={cx - 16 * cloud.scale}
                  cy={cloud.y + 3}
                  rx={16 * cloud.scale}
                  ry={8 * cloud.scale}
                  fill={cloudColor}
                />
              </g>
            );
          })}
        </g>

        {/* Earth (lower half) */}
        <rect x={0} y={HORIZON_Y} width={VIEW_W} height={VIEW_H - HORIZON_Y} fill="url(#earth)" />

        {/* Soil furrows for texture */}
        {FURROW_LAYOUT.map((furrow) => (
          <path
            key={furrow.id}
            d={`M10,${furrow.y} Q200,${furrow.y + 6} 390,${furrow.y}`}
            fill="none"
            stroke="#000000"
            strokeOpacity={0.08}
            strokeWidth={3}
          />
        ))}

        {/* Scattered rocks */}
        {ROCK_LAYOUT.map((rock) => (
          <ellipse
            key={rock.id}
            cx={rock.x}
            cy={rock.y}
            rx={5 * rock.scale}
            ry={3 * rock.scale}
            fill="#000000"
            opacity={0.12}
          />
        ))}

        {/* Snow settles on the ground in winter */}
        <g opacity={winterWeight}>
          {SNOW_LAYOUT.map((flake) => {
            const fallY = flake.y + ((timeMs / 40) % 30) * flake.scale * 0.2;
            return (
              <circle
                key={flake.id}
                cx={flake.x}
                cy={Math.min(fallY, VIEW_H - 8)}
                r={2 * flake.scale}
                fill="#f5f9ff"
                opacity={0.85}
              />
            );
          })}
        </g>

        {/* Fallen/falling leaves in autumn */}
        <g opacity={autumnWeight}>
          {LEAF_LAYOUT.map((leaf) => (
            <ellipse
              key={leaf.id}
              cx={leaf.x}
              cy={leaf.y}
              rx={5 * leaf.scale}
              ry={2.5 * leaf.scale}
              fill="#c9622a"
              transform={`rotate(${(leaf.phase * 180) / Math.PI} ${leaf.x} ${leaf.y})`}
              opacity={0.85}
            />
          ))}
        </g>

        {/* Spring blossoms along the grass line */}
        <g opacity={springWeight}>
          {FLOWER_LAYOUT.map((flower) => (
            <circle
              key={flower.id}
              cx={flower.x}
              cy={flower.y}
              r={2.2 * flower.scale}
              fill={flower.id % 2 === 0 ? "#ffb6d9" : "#fff275"}
              opacity={0.9}
            />
          ))}
        </g>

        {/* Grass along the horizon boundary (back layer) */}
        <path
          d={zigzagGrassPath(VIEW_W, HORIZON_Y, 40, 12)}
          fill="none"
          stroke={grassFinal}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* A second, closer row of grass in front for a bit of depth */}
        <path
          d={zigzagGrassPath(VIEW_W + 20, HORIZON_Y + 6, 34, 16, -10)}
          fill="none"
          stroke={grassFrontFinal}
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Horizon line */}
        <line x1={0} y1={HORIZON_Y} x2={VIEW_W} y2={HORIZON_Y} stroke="#4b1f7a" strokeWidth={3} />

        {/* Time track */}
        <circle
          cx={CENTER_X}
          cy={HORIZON_Y}
          r={TRACK_RADIUS}
          fill="none"
          stroke="#f4a6c9"
          strokeOpacity={0.65}
          strokeWidth={2}
        />

        {/* Hour markers */}
        {HOUR_MARKERS.map((marker) => {
          const anglePoint = pointOnCircle(
            CENTER_X,
            HORIZON_Y,
            TRACK_RADIUS + 20,
            -90 - marker.hoursSinceNoon * 15,
          );
          return (
            <text
              key={marker.label}
              x={anglePoint.x}
              y={anglePoint.y}
              fontSize={11}
              fill="#ffffff"
              opacity={0.75}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {marker.label}
            </text>
          );
        })}

        {/* Sun */}
        <circle cx={sunPoint.x} cy={sunPoint.y} r={SUN_RADIUS * 2.2} fill="url(#sunGlow)" />
        <circle
          cx={sunPoint.x}
          cy={sunPoint.y}
          r={SUN_RADIUS}
          fill={sunColor}
          stroke="#ffffff"
          strokeOpacity={0.5}
          strokeWidth={1.5}
        />

        {/* Reminder dots */}
        {reminderPoints.map(({ reminder, point }) => (
          <g
            key={reminder.id}
            onClick={() => setSelectedId((cur) => (cur === reminder.id ? null : reminder.id))}
            className="cursor-pointer"
          >
            <circle cx={point.x} cy={point.y} r={HIT_RADIUS} fill="transparent" />
            <circle
              cx={point.x}
              cy={point.y}
              r={DOT_RADIUS}
              fill="#ff8c1a"
              stroke="#ffffff"
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>

      {selected && (
        <ReminderPopover
          reminder={selected.reminder}
          xPercent={(selected.point.x / VIEW_W) * 100}
          yPercent={(selected.point.y / VIEW_H) * 100}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
