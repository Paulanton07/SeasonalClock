import { useState } from "react";
import SeasonalClockFace from "./components/SeasonalClockFace";
import OrbitTracker from "./components/OrbitTracker";
import { ModeToggle, DemoControls } from "./components/ClockControls";
import AddReminderModal from "./components/AddReminderModal";
import SeasonIndicator from "./components/SeasonIndicator";
import { formatDigitalTime } from "./lib/clockMath";
import { useReminders } from "./hooks/useReminders";
import { useSimulatedClock } from "./hooks/useSimulatedClock";

function App() {
  const { now, mode, setMode, daysPerSecond, setDaysPerSecond, resetDemo } =
    useSimulatedClock();
  const { reminders, addReminder } = useReminders();
  const [activeTab, setActiveTab] = useState<"clock" | "orbit">("clock");
  const [showAddModal, setShowAddModal] = useState(false);

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-950 text-white font-sans">
      {/* 1. Main full-bleed scenery / views */}
      <main className="absolute inset-0 h-full w-full">
        {activeTab === "clock" ? (
          <SeasonalClockFace now={now} reminders={reminders} />
        ) : (
          <OrbitTracker now={now} />
        )}
      </main>

      {/* 2. Top Floating Glass HUD */}
      <header className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
        {/* Left item: Digital Time (+ Season on mobile) */}
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
          <div className="pointer-events-auto rounded-2xl bg-black/40 px-3.5 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md border border-white/15 shadow-xl flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white">
              {formatDigitalTime(now)}
            </span>
            <span className="text-xs text-white/70 font-medium hidden sm:inline">
              {formattedDate}
            </span>
          </div>

          {/* On mobile, place SeasonIndicator opposite the time */}
          <div className="sm:hidden pointer-events-auto">
            <SeasonIndicator now={now} />
          </div>
        </div>

        {/* Center: View Switcher (Clock / Orbit) & Mode Switcher (Live / Demo) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Clock / Orbit Toggle */}
          <div className="flex items-center rounded-full bg-black/40 p-1 backdrop-blur-md border border-white/15 shadow-xl select-none">
            <button
              type="button"
              onClick={() => setActiveTab("clock")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeTab === "clock"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Clock
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orbit")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeTab === "orbit"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Orbit
            </button>
          </div>

          {/* Live / Demo Mode Toggle */}
          <ModeToggle mode={mode} onModeChange={setMode} />
        </div>

        {/* Right item on desktop: Season Indicator */}
        <div className="hidden sm:block pointer-events-auto">
          <SeasonIndicator now={now} />
        </div>
      </header>

      {/* 3. Bottom Floating Controls & Action Button */}
      <footer className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-10 flex items-end justify-between gap-3 pointer-events-none">
        {/* Bottom Left: Fast-forward Demo Controls (when Demo mode is active) */}
        <div className="pointer-events-auto">
          {mode === "demo" && (
            <DemoControls
              daysPerSecond={daysPerSecond}
              onSpeedChange={setDaysPerSecond}
              onReset={resetDemo}
            />
          )}
        </div>

        {/* Bottom Right: Add Reminder Button (only on Clock view) */}
        {activeTab === "clock" && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-md border border-white/20 transition transform active:scale-95 hover:scale-105"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Add reminder</span>
          </button>
        )}
      </footer>

      {/* 4. Add Reminder Modal */}
      {showAddModal && (
        <AddReminderModal
          onAdd={addReminder}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default App;
