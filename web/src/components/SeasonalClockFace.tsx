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
  FURROW_DEPTHS,
  LEAF_LAYOUT,
  ROCK_LAYOUT,
  SNOW_LAYOUT,
  STAR_LAYOUT,
} from "../lib/decorLayout";
import { useContainerDimensions } from "../hooks/useContainerDimensions";
import ReminderPopover from "./ReminderPopover";

const HOUR_MARKERS = [
  { hoursSinceNoon: 0, label: "12PM", subLabel: "Noon" },
  { hoursSinceNoon: 3, label: "3PM", subLabel: "" },
  { hoursSinceNoon: 6, label: "6PM", subLabel: "Sunset" },
  { hoursSinceNoon: 9, label: "9PM", subLabel: "" },
  { hoursSinceNoon: 12, label: "12AM", subLabel: "Midnight" },
  { hoursSinceNoon: 15, label: "3AM", subLabel: "" },
  { hoursSinceNoon: 18, label: "6AM", subLabel: "Sunrise" },
  { hoursSinceNoon: 21, label: "9AM", subLabel: "" },
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
  const { ref, dimensions } = useContainerDimensions<HTMLDivElement>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const width = dimensions.width || 800;
  const height = dimensions.height || 600;

  // Horizon splits the canvas right at the vertical midpoint
  const centerX = width / 2;
  const horizonY = Math.round(height * 0.5);

  // Responsive radius: maximizes the dial on both portrait and landscape screens
  // leaving comfortable room for markers and floating HUD badges
  const trackRadius = useMemo(() => {
    const maxRadius = Math.min(width * 0.38, height * 0.34, 420);
    return Math.max(120, Math.round(maxRadius));
  }, [width, height]);

  const sunRadius = Math.max(16, Math.min(26, Math.round(trackRadius * 0.085)));
  const dotRadius = Math.max(8, Math.min(13, Math.round(trackRadius * 0.045)));
  const hitRadius = Math.max(22, dotRadius * 2);
  const twilightBand = Math.max(25, Math.round(height * 0.05));

  const weights = useMemo(() => getSeasonWeights(now), [now]);

  const sunPoint = useMemo(
    () => pointOnCircle(centerX, horizonY, trackRadius, angleForDate(now)),
    [centerX, horizonY, trackRadius, now],
  );

  // Continuous 0..1 night factor with a soft twilight fade around the horizon
  const nightFactor = smoothstep(-twilightBand, twilightBand, sunPoint.y - horizonY);

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
          centerX,
          horizonY,
          trackRadius,
          angleForDate(new Date(r.eventTime)),
        );
        return { reminder: r, point };
      }),
    [reminders, centerX, horizonY, trackRadius],
  );

  const selected = reminderPoints.find((r) => r.reminder.id === selectedId);
  const timeMs = now.getTime();

  // Grass parameters scaled to viewport width
  const grassTeeth = Math.max(30, Math.round(width / 14));
  const frontGrassTeeth = Math.max(26, Math.round(width / 16));

  // 24-hour tick divisions (15 deg each)
  const hourTicks = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = -90 - i * 15;
      const isMajor = i % 3 === 0;
      const inner = pointOnCircle(centerX, horizonY, trackRadius - (isMajor ? 8 : 4), angle);
      const outer = pointOnCircle(centerX, horizonY, trackRadius + (isMajor ? 8 : 4), angle);
      return { id: i, inner, outer, isMajor };
    });
  }, [centerX, horizonY, trackRadius]);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden select-none">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBottom} />
          </linearGradient>
          <linearGradient id="earthGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={earthTopFinal} />
            <stop offset="100%" stopColor={earthBottomFinal} />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sunColor} stopOpacity="0.65" />
            <stop offset="50%" stopColor={sunColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={sunColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sunAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={sunColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={sunColor} stopOpacity="0" />
          </radialGradient>
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Sky layer (spans from top to horizon) */}
        <rect x={0} y={0} width={width} height={horizonY} fill="url(#skyGrad)" />

        {/* Stars fade in during night across entire sky */}
        <g opacity={nightFactor}>
          {STAR_LAYOUT.map((star) => {
            const twinkle = 0.5 + 0.5 * Math.sin(timeMs / 900 + star.phase);
            const x = star.xPct * width;
            const y = Math.max(15, star.yPct * (horizonY - 20));
            return (
              <circle
                key={star.id}
                cx={x}
                cy={y}
                r={1.1 * star.scale}
                fill="#ffffff"
                opacity={0.35 + 0.55 * twinkle}
              />
            );
          })}
        </g>

        {/* Clouds drift across the sky during daytime */}
        <g opacity={dayFactor * 0.88}>
          {CLOUD_LAYOUT.map((cloud) => {
            const drift = Math.sin(timeMs / 40000 + cloud.phase) * 20;
            const cx = ((cloud.xPct * width + drift) % width + width) % width;
            const cy = Math.max(35, cloud.yPct * (horizonY - 50));
            return (
              <g key={cloud.id} opacity={0.82}>
                <ellipse cx={cx} cy={cy} rx={36 * cloud.scale} ry={13 * cloud.scale} fill={cloudColor} />
                <ellipse
                  cx={cx + 22 * cloud.scale}
                  cy={cy + 4}
                  rx={22 * cloud.scale}
                  ry={10 * cloud.scale}
                  fill={cloudColor}
                />
                <ellipse
                  cx={cx - 22 * cloud.scale}
                  cy={cy + 4}
                  rx={22 * cloud.scale}
                  ry={10 * cloud.scale}
                  fill={cloudColor}
                />
              </g>
            );
          })}
        </g>

        {/* 2. Earth layer (spans from horizon to bottom of screen) */}
        <rect
          x={0}
          y={horizonY}
          width={width}
          height={height - horizonY}
          fill="url(#earthGrad)"
        />

        {/* Soil furrows spanning full screen width */}
        {FURROW_DEPTHS.map((depthPct, idx) => {
          const y = horizonY + 20 + depthPct * (height - horizonY - 40);
          return (
            <path
              key={idx}
              d={`M 0,${y} Q ${width * 0.25},${y + 8} ${width * 0.5},${y} T ${width},${y}`}
              fill="none"
              stroke="#000000"
              strokeOpacity={0.1}
              strokeWidth={3}
            />
          );
        })}

        {/* Scattered soil rocks */}
        {ROCK_LAYOUT.map((rock) => {
          const x = rock.xPct * width;
          const y = horizonY + 20 + rock.yPct * (height - horizonY - 40);
          return (
            <ellipse
              key={rock.id}
              cx={x}
              cy={y}
              rx={6 * rock.scale}
              ry={3.5 * rock.scale}
              fill="#000000"
              opacity={0.14}
            />
          );
        })}

        {/* Winter snow patches */}
        <g opacity={winterWeight}>
          {SNOW_LAYOUT.map((flake) => {
            const x = flake.xPct * width;
            const fallOffset = ((timeMs / 45) % 40) * flake.scale * 0.25;
            const y = Math.min(
              horizonY + 20 + flake.yPct * (height - horizonY - 35) + fallOffset,
              height - 10,
            );
            return (
              <circle
                key={flake.id}
                cx={x}
                cy={y}
                r={2.4 * flake.scale}
                fill="#f5f9ff"
                opacity={0.9}
              />
            );
          })}
        </g>

        {/* Autumn fallen leaves */}
        <g opacity={autumnWeight}>
          {LEAF_LAYOUT.map((leaf) => {
            const x = leaf.xPct * width;
            const y = horizonY + 15 + leaf.yPct * (height - horizonY - 30);
            return (
              <ellipse
                key={leaf.id}
                cx={x}
                cy={y}
                rx={6 * leaf.scale}
                ry={3 * leaf.scale}
                fill="#c9622a"
                transform={`rotate(${(leaf.phase * 180) / Math.PI} ${x} ${y})`}
                opacity={0.88}
              />
            );
          })}
        </g>

        {/* Spring flowers along the grass line */}
        <g opacity={springWeight}>
          {FLOWER_LAYOUT.map((flower) => {
            const x = flower.xPct * width;
            const y = horizonY - 2 + flower.yPct * 14;
            return (
              <circle
                key={flower.id}
                cx={x}
                cy={y}
                r={2.8 * flower.scale}
                fill={flower.id % 2 === 0 ? "#ffb6d9" : "#fff275"}
                opacity={0.92}
              />
            );
          })}
        </g>

        {/* Grass along the horizon boundary (back layer) */}
        <path
          d={zigzagGrassPath(width, horizonY, grassTeeth, 13)}
          fill="none"
          stroke={grassFinal}
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Closer, darker row of grass in front for rich depth */}
        <path
          d={zigzagGrassPath(width + 20, horizonY + 6, frontGrassTeeth, 18, -10)}
          fill="none"
          stroke={grassFrontFinal}
          strokeWidth={4}
          strokeLinejoin="round"
        />

        {/* Horizon boundary line with subtle glowing aura */}
        <line
          x1={0}
          y1={horizonY}
          x2={width}
          y2={horizonY}
          stroke="#4b1f7a"
          strokeWidth={3}
        />
        <line
          x1={0}
          y1={horizonY}
          x2={width}
          y2={horizonY}
          stroke="#a855f7"
          strokeWidth={1}
          strokeOpacity={0.4}
        />

        {/* 3. Astronomical 24-Hour Dial */}

        {/* Outer celestial faint ring */}
        <circle
          cx={centerX}
          cy={horizonY}
          r={trackRadius + 14}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.08}
          strokeWidth={1}
          strokeDasharray="2 4"
        />

        {/* Main celestial track */}
        <circle
          cx={centerX}
          cy={horizonY}
          r={trackRadius}
          fill="none"
          stroke="#f4a6c9"
          strokeOpacity={0.75}
          strokeWidth={2.5}
        />

        {/* 24-hour radial tick marks */}
        {hourTicks.map((tick) => (
          <line
            key={tick.id}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke="#ffffff"
            strokeOpacity={tick.isMajor ? 0.75 : 0.3}
            strokeWidth={tick.isMajor ? 2 : 1}
          />
        ))}

        {/* Center compass pivot node on horizon */}
        <circle
          cx={centerX}
          cy={horizonY}
          r={7}
          fill="#ffffff"
          opacity={0.8}
        />
        <circle
          cx={centerX}
          cy={horizonY}
          r={14}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />

        {/* Sundial solar beam pointing from center to current sun position */}
        <line
          x1={centerX}
          y1={horizonY}
          x2={sunPoint.x}
          y2={sunPoint.y}
          stroke={sunColor}
          strokeWidth={2}
          strokeOpacity={0.45}
          strokeDasharray="4 4"
        />

        {/* 4. Hour Markers & Labels (High contrast badges) */}
        {HOUR_MARKERS.map((marker) => {
          const markerRadius = trackRadius + (width < 500 ? 20 : 26);
          const anglePoint = pointOnCircle(
            centerX,
            horizonY,
            markerRadius,
            -90 - marker.hoursSinceNoon * 15,
          );

          const isCardinals = marker.subLabel !== "";
          const badgeW = isCardinals && marker.subLabel ? 56 : 44;
          const badgeH = isCardinals && marker.subLabel ? 28 : 20;

          return (
            <g
              key={marker.label}
              transform={`translate(${anglePoint.x}, ${anglePoint.y})`}
              filter="url(#badgeShadow)"
            >
              {/* Semi-transparent dark backing pill for readability over sky/soil */}
              <rect
                x={-badgeW / 2}
                y={-badgeH / 2}
                width={badgeW}
                height={badgeH}
                rx={Math.round(badgeH / 2)}
                fill="rgba(10, 15, 26, 0.65)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
              />
              <text
                x={0}
                y={marker.subLabel ? -3 : 0}
                fontSize={width < 500 ? 11 : 12}
                fontWeight="700"
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono tracking-tight"
              >
                {marker.label}
              </text>
              {marker.subLabel && (
                <text
                  x={0}
                  y={8}
                  fontSize={8}
                  fontWeight="500"
                  fill="#93c5fd"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="uppercase tracking-wider"
                >
                  {marker.subLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* 5. Sun with Glowing Aura and Flare Rings */}
        {/* Soft atmospheric halo */}
        <circle
          cx={sunPoint.x}
          cy={sunPoint.y}
          r={sunRadius * 3.2}
          fill="url(#sunGlow)"
        />
        {/* Corona ring */}
        <circle
          cx={sunPoint.x}
          cy={sunPoint.y}
          r={sunRadius * 1.4}
          fill="none"
          stroke={sunColor}
          strokeWidth={1.5}
          strokeOpacity={0.5}
        />
        {/* Sun body */}
        <circle
          cx={sunPoint.x}
          cy={sunPoint.y}
          r={sunRadius}
          fill={sunColor}
          stroke="#ffffff"
          strokeOpacity={0.7}
          strokeWidth={2}
        />
        {/* Sun center highlight */}
        <circle
          cx={sunPoint.x}
          cy={sunPoint.y}
          r={sunRadius * 0.45}
          fill="url(#sunAura)"
        />

        {/* 6. Reminder Pins */}
        {reminderPoints.map(({ reminder, point }) => (
          <g
            key={reminder.id}
            onClick={() => setSelectedId((cur) => (cur === reminder.id ? null : reminder.id))}
            className="cursor-pointer group"
          >
            {/* Invisible large touch hit target */}
            <circle cx={point.x} cy={point.y} r={hitRadius} fill="transparent" />

            {/* Glowing pin pulse halo */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotRadius * 1.8}
              fill="#ff8c1a"
              opacity={0.35}
            />
            {/* Pin core */}
            <circle
              cx={point.x}
              cy={point.y}
              r={dotRadius}
              fill="#ff8c1a"
              stroke="#ffffff"
              strokeWidth={2.5}
            />
          </g>
        ))}
      </svg>

      {/* Reminder Popover Card */}
      {selected && (
        <ReminderPopover
          reminder={selected.reminder}
          xPercent={(selected.point.x / width) * 100}
          yPercent={(selected.point.y / height) * 100}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
