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

export default function SeasonIndicator({ now }: Props) {
  const weights = useMemo(() => getSeasonWeights(now), [now]);
  const season = dominantSeason(weights);
  const gradient = useMemo(() => buildYearGradient(now.getFullYear()), [now]);
  const day = dayOfYear(now);
  const markerPct = Math.min(100, Math.max(0, (day / 365) * 100));

  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-black/40 px-3 py-1.5 sm:px-4 sm:py-2 text-white backdrop-blur-md border border-white/15 shadow-xl select-none">
      <span className="text-xl sm:text-2xl leading-none" role="img" aria-label={season}>
        {SEASON_ICONS[season]}
      </span>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            {SEASON_PALETTES[season].label}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-white/60">
            Day {day}/365
          </span>
        </div>
        <div
          className="relative mt-1 h-2 w-24 sm:w-32 overflow-hidden rounded-full shadow-inner border border-white/10"
          style={{ background: gradient }}
        >
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-white shadow-md transition-all duration-300"
            style={{ left: `${markerPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
