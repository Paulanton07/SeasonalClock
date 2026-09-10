import { useMemo } from "react";
import { dayOfYear, dominantSeason, getSeasonWeights } from "../lib/seasonBlend";
import { SEASON_PALETTES } from "../lib/seasonPalette";
import type { Season } from "../lib/clockMath";

const SEASON_ICONS: Record<Season, string> = {
  spring: "🌱",
  summer: "☀️",
  autumn: "🍂",
  winter: "❄️",
};

function buildYearGradient(year: number): string {
  const steps = 72;
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const day = (i / steps) * 365;
    const date = new Date(year, 0, 1 + day);
    const weights = getSeasonWeights(date);
    const season = dominantSeason(weights);
    stops.push(`${SEASON_PALETTES[season].grass} ${((i / steps) * 100).toFixed(1)}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

interface Props {
  now: Date;
}

/** A clearer, always-visible "where are we in the year" cue — not just night/day lighting. */
export default function SeasonIndicator({ now }: Props) {
  const weights = useMemo(() => getSeasonWeights(now), [now]);
  const season = dominantSeason(weights);
  const gradient = useMemo(() => buildYearGradient(now.getFullYear()), [now]);
  const markerPct = (dayOfYear(now) / 365) * 100;

  return (
    <div className="rounded-2xl bg-black/45 px-3 py-2 text-white backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <span className="text-base leading-none">{SEASON_ICONS[season]}</span>
        {SEASON_PALETTES[season].label}
      </div>
      <div className="relative mt-1.5 h-2 w-28 overflow-hidden rounded-full" style={{ background: gradient }}>
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-white shadow"
          style={{ left: `${markerPct}%` }}
        />
      </div>
    </div>
  );
}
