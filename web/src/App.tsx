import { useState } from "react";
import SeasonalClockFace from "./components/SeasonalClockFace";
import OrbitTracker from "./components/OrbitTracker";
import ClockControls from "./components/ClockControls";
import AddReminderModal from "./components/AddReminderModal";
import Carousel from "./components/Carousel";
import SeasonIndicator from "./components/SeasonIndicator";
import { formatDigitalTime } from "./lib/clockMath";
import { useReminders } from "./hooks/useReminders";
import { useSimulatedClock } from "./hooks/useSimulatedClock";

function App() {
  const { now, mode, setMode, daysPerSecond, setDaysPerSecond, resetDemo } = useSimulatedClock();
  const { reminders, addReminder } = useReminders();
  const [showAddModal, setShowAddModal] = useState(false);

  const clockPage = (
    <div className="flex h-full flex-col items-center gap-2 px-4 pb-3">
      <ClockControls
        mode={mode}
        onModeChange={setMode}
        daysPerSecond={daysPerSecond}
        onSpeedChange={setDaysPerSecond}
        onReset={resetDemo}
      />

      {/* Kept out of the artwork itself so it never covers the sun/dial at small sizes */}
      <div className="flex w-full max-w-sm shrink-0 items-center justify-between gap-2">
        <div className="rounded-2xl bg-white/10 px-4 py-1.5 font-mono text-2xl font-bold tracking-wider text-white shadow">
          {formatDigitalTime(now)}
        </div>
        <SeasonIndicator now={now} />
      </div>

      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <SeasonalClockFace now={now} reminders={reminders} />
      </div>
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white shadow-lg hover:bg-orange-600"
      >
        <span className="text-lg leading-none">+</span> Add reminder
      </button>
    </div>
  );

  const orbitPage = (
    <div className="flex h-full items-center justify-center overflow-y-auto px-4 py-3">
      <OrbitTracker now={now} />
    </div>
  );

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-slate-950 text-white">
      <Carousel
        pages={[
          { label: "Clock", content: clockPage },
          { label: "Orbit", content: orbitPage },
        ]}
      />

      {showAddModal && (
        <AddReminderModal onAdd={addReminder} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

export default App;
