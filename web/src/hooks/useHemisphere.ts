import { useState } from "react";
import type { Hemisphere } from "../lib/clockMath";
import { detectHemisphere } from "../lib/hemisphere";

const STORAGE_KEY = "seasonal-clock:hemisphere";

function loadInitial(): Hemisphere {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "north" || stored === "south") return stored;
  } catch {
    // storage unavailable; fall back to detection
  }
  return detectHemisphere();
}

/**
 * Hemisphere guessed from the browser time zone. Only an explicit user choice
 * is persisted, so the guess keeps following the time zone until overridden.
 */
export function useHemisphere() {
  const [hemisphere, setHemisphereState] = useState<Hemisphere>(loadInitial);

  function setHemisphere(next: Hemisphere) {
    setHemisphereState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  return { hemisphere, setHemisphere };
}
