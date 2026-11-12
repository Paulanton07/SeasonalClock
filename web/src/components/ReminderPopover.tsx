import { useState } from "react";
import type { Reminder } from "../types";

interface Props {
  reminder: Reminder;
  xPercent: number;
  yPercent: number;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ReminderPopover({
  reminder,
  xPercent,
  yPercent,
  onClose,
  onDelete,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  // Keep the card on-screen even when the dot sits near an edge.
  const left = Math.min(Math.max(xPercent, 18), 82);
  const top = Math.min(Math.max(yPercent, 12), 88);

  const time = new Date(reminder.eventTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="absolute z-10 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3.5 text-slate-900 shadow-2xl"
        style={{ left: `${left}%`, top: `${top}%` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-lg font-semibold">{reminder.title}</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-0.5 text-base font-medium text-orange-600">{time}</p>
        {reminder.notes && <p className="mt-1 text-base text-slate-600">{reminder.notes}</p>}

        <div className="mt-3 flex items-center justify-end gap-2">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => onDelete(reminder.id)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}
