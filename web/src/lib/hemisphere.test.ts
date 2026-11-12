import { describe, expect, it } from "vitest";
import { angleForHoursSinceNoon } from "./clockMath";
import { hemisphereForTimeZone } from "./hemisphere";
import { dominantSeason, getSeasonWeights } from "./seasonBlend";

const seasonOn = (month: number, day: number, hemisphere: "north" | "south") =>
  dominantSeason(getSeasonWeights(new Date(2026, month - 1, day), hemisphere));

describe("season by hemisphere", () => {
  it("shows spring in the south and autumn in the north on 12 Nov", () => {
    expect(seasonOn(11, 12, "south")).toBe("spring");
    expect(seasonOn(11, 12, "north")).toBe("autumn");
  });

  it("flips on meteorological boundaries", () => {
    expect(seasonOn(11, 30, "south")).toBe("spring");
    expect(seasonOn(12, 2, "south")).toBe("summer");
    expect(seasonOn(12, 2, "north")).toBe("winter");
    expect(seasonOn(6, 15, "south")).toBe("winter");
    expect(seasonOn(6, 15, "north")).toBe("summer");
  });
});

describe("sun direction", () => {
  it("puts noon at the top in both hemispheres", () => {
    expect(angleForHoursSinceNoon(0, "south")).toBe(-90);
    expect(angleForHoursSinceNoon(0, "north")).toBe(-90);
  });

  it("sweeps anticlockwise in the south and clockwise in the north", () => {
    expect(angleForHoursSinceNoon(6, "south")).toBe(-180);
    expect(angleForHoursSinceNoon(6, "north")).toBe(0);
  });
});

describe("hemisphereForTimeZone", () => {
  it("detects southern and northern zones", () => {
    expect(hemisphereForTimeZone("Africa/Johannesburg")).toBe("south");
    expect(hemisphereForTimeZone("Australia/Sydney")).toBe("south");
    expect(hemisphereForTimeZone("Europe/London")).toBe("north");
    expect(hemisphereForTimeZone(undefined)).toBe("north");
  });
});
