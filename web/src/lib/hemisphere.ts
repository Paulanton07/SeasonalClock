import type { Hemisphere } from "./clockMath";

const SOUTHERN_PREFIXES = ["Australia/", "Antarctica/"];

const SOUTHERN_ZONES = new Set([
  // Africa
  "Africa/Johannesburg", "Africa/Maseru", "Africa/Mbabane", "Africa/Windhoek",
  "Africa/Gaborone", "Africa/Harare", "Africa/Maputo", "Africa/Lusaka",
  "Africa/Blantyre", "Africa/Lubumbashi", "Africa/Luanda", "Africa/Dar_es_Salaam",
  "Africa/Bujumbura", "Africa/Kigali",
  // Indian Ocean
  "Indian/Antananarivo", "Indian/Mauritius", "Indian/Reunion", "Indian/Comoro",
  "Indian/Mayotte", "Indian/Mahe", "Indian/Maldives", "Indian/Chagos",
  // South America
  "America/Sao_Paulo", "America/Bahia", "America/Fortaleza", "America/Recife",
  "America/Belem", "America/Manaus", "America/Cuiaba", "America/Campo_Grande",
  "America/Argentina/Buenos_Aires", "America/Buenos_Aires", "America/Santiago",
  "America/Lima", "America/La_Paz", "America/Asuncion", "America/Montevideo",
  "America/Punta_Arenas", "America/Cordoba", "America/Mendoza",
  // Asia / Pacific south of the equator
  "Asia/Jakarta", "Asia/Makassar", "Asia/Dili",
  "Pacific/Auckland", "Pacific/Chatham", "Pacific/Fiji", "Pacific/Tongatapu",
  "Pacific/Apia", "Pacific/Pago_Pago", "Pacific/Tahiti", "Pacific/Noumea",
  "Pacific/Norfolk", "Pacific/Efate", "Pacific/Port_Moresby", "Pacific/Guadalcanal",
  "Pacific/Rarotonga", "Pacific/Niue", "Pacific/Easter", "Pacific/Marquesas",
  "Pacific/Gambier", "Pacific/Funafuti", "Pacific/Wallis", "Pacific/Fakaofo",
]);

/** Best-effort guess from an IANA time-zone name; anything unrecognised is treated as northern. */
export function hemisphereForTimeZone(timeZone: string | undefined): Hemisphere {
  if (!timeZone) return "north";
  if (SOUTHERN_ZONES.has(timeZone)) return "south";
  return SOUTHERN_PREFIXES.some((p) => timeZone.startsWith(p)) ? "south" : "north";
}

export function detectHemisphere(): Hemisphere {
  try {
    return hemisphereForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return "north";
  }
}
