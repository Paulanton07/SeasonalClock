import { useEffect, useRef, useState } from "react";

export type ClockMode = "real" | "demo";

/**
 * Drives the whole app's notion of "now". In real mode it just ticks with
 * the system clock. In demo mode it fast-forwards a simulated date at an
 * adjustable rate so every season transition can be watched.
 */
export function useSimulatedClock() {
  const [mode, setMode] = useState<ClockMode>("real");
  const [daysPerSecond, setDaysPerSecond] = useState(0.25);
  const [now, setNow] = useState(() => new Date());

  const simulatedRef = useRef(new Date());
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    if (mode === "real") {
      setNow(new Date());
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }

    simulatedRef.current = new Date();
  }, [mode]);

  useEffect(() => {
    if (mode !== "demo") return;

    lastFrameRef.current = performance.now();

    const tick = (t: number) => {
      const deltaSeconds = (t - lastFrameRef.current) / 1000;
      lastFrameRef.current = t;
      simulatedRef.current = new Date(
        simulatedRef.current.getTime() + deltaSeconds * daysPerSecond * 86_400_000,
      );
      setNow(new Date(simulatedRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, daysPerSecond]);

  function resetDemo() {
    const jan1 = new Date(new Date().getFullYear(), 0, 1);
    simulatedRef.current = jan1;
    setNow(new Date(jan1));
  }

  return { now, mode, setMode, daysPerSecond, setDaysPerSecond, resetDemo };
}
