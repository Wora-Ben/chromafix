import { describe, expect, it } from "vitest";
import type { CvdType, Palette } from "../src/core/palettes";
import {
  CVD_TYPES,
  PALETTES,
  PALETTES_DARK,
  paletteFor,
  ROLES,
} from "../src/core/palettes";

const SETS: [string, Record<CvdType, Palette>][] = [
  ["light", PALETTES],
  ["dark", PALETTES_DARK],
];

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

describe.each(SETS)("%s palettes", (_name, set) => {
  it("defines a palette for every deficiency type", () => {
    expect(Object.keys(set).sort()).toEqual([...CVD_TYPES].sort());
  });

  it("defines every role as a hex color", () => {
    for (const type of CVD_TYPES) {
      for (const role of ROLES) {
        expect(set[type][role]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("gives each type a distinct primary color", () => {
    const primaries = CVD_TYPES.map((t) => set[t].primary);
    expect(new Set(primaries).size).toBe(CVD_TYPES.length);
  });

  // Hold the palettes to the standard they exist to meet.
  it("meets WCAG AA contrast against its own background", () => {
    for (const type of CVD_TYPES) {
      const { background, text, muted, primary } = set[type];
      expect(contrast(text, background), `${type} text`).toBeGreaterThanOrEqual(7);
      expect(contrast(muted, background), `${type} muted`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(primary, background), `${type} primary`).toBeGreaterThanOrEqual(
        3,
      );
    }
  });
});

describe("scheme orientation", () => {
  it("light backgrounds are light and dark backgrounds are dark", () => {
    for (const type of CVD_TYPES) {
      expect(luminance(PALETTES[type].background)).toBeGreaterThan(0.5);
      expect(luminance(PALETTES_DARK[type].background)).toBeLessThan(0.1);
    }
  });

  it("paletteFor selects the requested set", () => {
    expect(paletteFor("deuteranopia", "light")).toBe(PALETTES.deuteranopia);
    expect(paletteFor("deuteranopia", "dark")).toBe(PALETTES_DARK.deuteranopia);
  });
});
