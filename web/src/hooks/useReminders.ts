import { useEffect, useState } from "react";
import type { Reminder } from "../types";
import { sampleReminders } from "../data/sampleReminders";

const STORAGE_KEY = "seasonal-clock:reminders";

function loadInitial(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Reminder[];
  } catch {
    // ignore malformed storage and fall back to sample data
  }
  return sampleReminders;
}

/**
 * Client-only reminder storage for the demo build. This is a stand-in for
 * the future Supabase `reminders` table (see docs/seasonal clock.txt §4) —
 * once auth + Postgres are wired up, this hook can be swapped for one that
 * reads/writes via supabase-js without touching any of the UI components.
 */
export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  function addReminder(reminder: Omit<Reminder, "id">) {
    setReminders((prev) => [
      ...prev,
      { ...reminder, id: crypto.randomUUID() },
    ]);
  }

  function removeReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  return { reminders, addReminder, removeReminder };
}
