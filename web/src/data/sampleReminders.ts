import type { Reminder } from "../types";

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Seed data so the demo has something to tap on before Supabase is wired up. */
export const sampleReminders: Reminder[] = [
  {
    id: "sample-1",
    title: "Dentist Appointment",
    notes: "Bring insurance card, arrive 10 minutes early.",
    eventTime: todayAt(15, 0),
  },
  {
    id: "sample-2",
    title: "Team Standup",
    notes: "Discuss sprint goals for the week.",
    eventTime: todayAt(9, 0),
  },
  {
    id: "sample-3",
    title: "Call Mom",
    notes: "Weekly catch-up call.",
    eventTime: todayAt(21, 0),
  },
];
