export interface Reminder {
  id: string;
  title: string;
  notes: string;
  /** ISO timestamp for the appointment. Only the time-of-day is plotted. */
  eventTime: string;
}
