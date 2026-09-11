export interface Reminder {
  id: string;
  title: string;
  notes: string;
  /** ISO timestamp for the appointment. Only the time-of-day is plotted. */
  eventTime: string;
}

export type { Season } from "./lib/clockMath";
export type {
  SeasonPalette,
  FlowerColorConfig,
  GrassPaletteConfig,
  SceneryPaletteConfig,
} from "./lib/seasonPalette";
export type { FlowerColorType, MeadowFlower } from "./lib/decorLayout";

