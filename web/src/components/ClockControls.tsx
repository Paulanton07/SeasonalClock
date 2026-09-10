import type { ClockMode } from "../hooks/useSimulatedClock";

interface Props {
  mode: ClockMode;
  onModeChange: (mode: ClockMode) => void;
  daysPerSecond: number;
  onSpeedChange: (value: number) => void;
  onReset: () => void;
}

export default function ClockControls({
  mode,
  onModeChange,
  daysPerSecond,
  onSpeedChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-full bg-slate-900/70 px-4 py-2 text-sm text-white shadow">
      <div className="flex overflow-hidden rounded-full border border-white/20">
        <button
          type="button"
          onClick={() => onModeChange("real")}
          className={`px-3 py-1 transition ${
            mode === "real" ? "bg-white text-slate-900" : "text-white/80"
          }`}
        >
          Live
        </button>
        <button
          type="button"
          onClick={() => onModeChange("demo")}
          className={`px-3 py-1 transition ${
            mode === "demo" ? "bg-white text-slate-900" : "text-white/80"
          }`}
        >
          Demo (fast-forward)
        </button>
      </div>

      {mode === "demo" && (
        <>
          <label className="flex items-center gap-2 text-xs text-white/80">
            Speed
            <input
              type="range"
              min={0.5}
              max={30}
              step={0.5}
              value={daysPerSecond}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
            />
            <span className="w-24 font-mono">
              {daysPerSecond.toFixed(1)}d/s (~{Math.round(365 / daysPerSecond)}s/yr)
            </span>
          </label>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
          >
            Restart from Jan 1
          </button>
        </>
      )}
    </div>
  );
}
