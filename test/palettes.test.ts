import { describe, expect, it } from "vitest";
import { CVD_TYPES, PALETTES, ROLES } from "../src/core/palettes";

describe("palettes", () => {
  it("defines a palette for every deficiency type", () => {
    expect(Object.keys(PALETTES).sort()).toEqual([...CVD_TYPES].sort());
  });

  it("defines every role as a hex color in each palette", () => {
    for (const type of CVD_TYPES) {
      for (const role of ROLES) {
        expect(PALETTES[type][role]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("gives each type a distinct primary color", () => {
    const primaries = CVD_TYPES.map((t) => PALETTES[t].primary);
    expect(new Set(primaries).size).toBe(CVD_TYPES.length);
  });
});
