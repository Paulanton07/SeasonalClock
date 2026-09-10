import type { Reminder } from "../types";

interface Props {
  reminder: Reminder;
  xPercent: number;
  yPercent: number;
  onClose: () => void;
}

export default function ReminderPopover({ reminder, xPercent, yPercent, onClose }: Props) {
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
        className="absolute z-10 w-48 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-3 text-slate-900 shadow-2xl"
        style={{ left: `${left}%`, top: `${top}%` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold">{reminder.title}</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="mt-0.5 text-xs font-medium text-orange-600">{time}</p>
        {reminder.notes && <p className="mt-1 text-xs text-slate-600">{reminder.notes}</p>}
      </div>
    </>
  );
}
