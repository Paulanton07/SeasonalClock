import type { Season } from "./clockMath";
import { mixHex } from "./seasonBlend";

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

// =============================================================================
// COLOR DATA MODELS: Neat, centralized configurations for all landscape colors
// =============================================================================

export interface FlowerColorConfig {
  name: string;
  petals: number;
  petalColor: string;
  centerColor: string;
  petalNightColor?: string;
  centerNightColor?: string;
  accentColor?: string;
  accentNightColor?: string;
}

/**
 * Centralized flower color palettes.
 * To change a flower's color or add new flower types (e.g. purple, blue, pink),
 * edit or add entries right here.
 */
export const FLOWER_PALETTES: Record<string, FlowerColorConfig> = {
  white: {
    name: "Daisy (White)",
    petals: 5,
    petalColor: "#ffffff",
    centerColor: "#f59e0b",
    petalNightColor: "#718096",
    centerNightColor: "#78350f",
  },
  red: {
    name: "Wild Poppy (Red)",
    petals: 4,
    petalColor: "#ef4444",
    centerColor: "#1c1917",
    petalNightColor: "#450a0a",
    centerNightColor: "#09090b",
    accentColor: "#f59e0b",
    accentNightColor: "#78350f",
  },
  yellow: {
    name: "Buttercup (Yellow)",
    petals: 5,
    petalColor: "#fbbf24",
    centerColor: "#d97706",
    petalNightColor: "#78350f",
    centerNightColor: "#451a03",
  },
};

/** Resolves day/night blended colors for any flower configuration. */
export function resolveFlowerColors(
  config: FlowerColorConfig,
  nightFactor: number,
) {
  return {
    petal: mixHex(
      config.petalColor,
      config.petalNightColor ?? "#475569",
      nightFactor * 0.65,
    ),
    center: mixHex(
      config.centerColor,
      config.centerNightColor ?? "#1e293b",
      nightFactor * 0.65,
    ),
    accent: config.accentColor
      ? mixHex(
          config.accentColor,
          config.accentNightColor ?? "#78350f",
          nightFactor * 0.65,
        )
      : undefined,
  };
}

export interface GrassPaletteConfig {
  backLayerNightTint: string;
  frontLayerBaseTint: string;
  frontLayerNightTint: string;
  turfOpacity: number;
}

/** Centralized grass color & night tint settings */
export const GRASS_PALETTE: GrassPaletteConfig = {
  backLayerNightTint: "#123018",
  frontLayerBaseTint: "#0d2410",
  frontLayerNightTint: "#081a0c",
  turfOpacity: 0.65,
};

export interface SceneryPaletteConfig {
  horizonGlowDeep: string;
  horizonGlowAura: string;
  celestialTrack: string;
  reminderPin: string;
}

/** Centralized scenery accents */
export const SCENERY_PALETTE: SceneryPaletteConfig = {
  horizonGlowDeep: "#4b1f7a",
  horizonGlowAura: "#a855f7",
  celestialTrack: "#f4a6c9",
  reminderPin: "#ff8c1a",
};

