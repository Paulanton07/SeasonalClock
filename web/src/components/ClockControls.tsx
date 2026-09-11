import type { ClockMode } from "../hooks/useSimulatedClock";

interface Props {
  mode: ClockMode;
  onModeChange: (mode: ClockMode) => void;
  daysPerSecond: number;
  onSpeedChange: (value: number) => void;
  onReset: () => void;
}

export function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: ClockMode;
  onModeChange: (mode: ClockMode) => void;
}) {
  return (
    <div className="flex items-center rounded-full bg-black/40 p-1 backdrop-blur-md border border-white/15 shadow-xl select-none">
      <button
        type="button"
        onClick={() => onModeChange("real")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          mode === "real"
            ? "bg-white text-slate-900 shadow-md"
            : "text-white/70 hover:text-white"
        }`}
      >
        Live
      </button>
      <button
        type="button"
        onClick={() => onModeChange("demo")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          mode === "demo"
            ? "bg-amber-400 text-slate-950 shadow-md"
            : "text-white/70 hover:text-white"
        }`}
      >
        Demo
      </button>
    </div>
  );
}

export function DemoControls({
  daysPerSecond,
  onSpeedChange,
  onReset,
}: {
  daysPerSecond: number;
  onSpeedChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-black/50 p-2.5 sm:px-4 sm:py-2.5 text-xs text-white backdrop-blur-md border border-white/15 shadow-2xl select-none">
      <span className="font-semibold text-amber-300 flex items-center gap-1">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        Fast-Forward:
      </span>
      <label className="flex items-center gap-2 text-white/90">
        <input
          type="range"
          min={0.25}
          max={15}
          step={0.25}
          value={daysPerSecond}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="accent-amber-400 cursor-pointer w-24 sm:w-28"
        />
        <span className="font-mono text-[11px] text-white/80 w-16">
          {(daysPerSecond * 10) % 1 === 0
            ? daysPerSecond.toFixed(1)
            : daysPerSecond.toFixed(2)}{" "}
          d/s
        </span>
      </label>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-medium text-white transition active:scale-95"
      >
        Reset Jan 1
      </button>
    </div>
  );
}

export default function ClockControls({
  mode,
  onModeChange,
  daysPerSecond,
  onSpeedChange,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ModeToggle mode={mode} onModeChange={onModeChange} />
      {mode === "demo" && (
        <DemoControls
          daysPerSecond={daysPerSecond}
          onSpeedChange={onSpeedChange}
          onReset={onReset}
        />
      )}
    </div>
  );
}
