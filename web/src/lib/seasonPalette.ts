import type { Season } from "./clockMath";

export interface SeasonPalette {
  skyTop: string;
  skyBottom: string;
  earthTop: string;
  earthBottom: string;
  grass: string;
  cloud: string;
  label: string;
}

/**
 * Illustrative seasonal palettes anchored to real solstices/equinoxes
 * (see lib/seasonBlend.ts). Colours are continuously interpolated day-by-day
 * rather than switched abruptly, so the scene drifts gradually through the
 * year the same way the real sky and landscape do.
 */
export const SEASON_PALETTES: Record<Season, SeasonPalette> = {
  spring: {
    skyTop: "#bfe9ff",
    skyBottom: "#7fc8e8",
    earthTop: "#84a35a",
    earthBottom: "#556b38",
    grass: "#5fae4a",
    cloud: "#ffffff",
    label: "Spring",
  },
  summer: {
    skyTop: "#8fd3ff",
    skyBottom: "#3fa9f5",
    earthTop: "#c9a24a",
    earthBottom: "#93702c",
    grass: "#7ec13f",
    cloud: "#ffffff",
    label: "Summer",
  },
  autumn: {
    skyTop: "#bcd0e2",
    skyBottom: "#8fa6c2",
    earthTop: "#a5652f",
    earthBottom: "#6e3d1a",
    grass: "#b08a2e",
    cloud: "#e9e3d8",
    label: "Autumn",
  },
  winter: {
    skyTop: "#d7e2ea",
    skyBottom: "#a9bccb",
    earthTop: "#8d9086",
    earthBottom: "#5c5f57",
    grass: "#8ba384",
    cloud: "#f3f5f7",
    label: "Winter",
  },
};

export const NIGHT_SKY = { top: "#0b1030", bottom: "#1f2a5c" };
export const SUN_DAY_COLOR = "#ffd23f";
export const SUN_NIGHT_COLOR = "#d2601a";
export const SNOW_COLOR = "#f5f9ff";
