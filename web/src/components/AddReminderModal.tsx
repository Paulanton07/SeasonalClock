import { useState } from "react";
import type { Reminder } from "../types";

interface Props {
  onAdd: (reminder: Omit<Reminder, "id">) => void;
  onClose: () => void;
}

export default function AddReminderModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const [hours, minutes] = time.split(":").map(Number);
    const eventDate = new Date();
    eventDate.setHours(hours, minutes, 0, 0);
    onAdd({ title: title.trim(), notes: notes.trim(), eventTime: eventDate.toISOString() });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-slate-900 shadow-2xl">
        <h2 className="mb-3 text-lg font-semibold">New reminder</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Title
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Dentist appointment"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Optional details"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Add reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
