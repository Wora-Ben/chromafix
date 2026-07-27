// @vitest-environment node
import { describe, expect, it } from "vitest";
import { applyPalette, CVD_TYPES, createChromafix } from "../src/core/index";

// With no DOM (Node/SSR), importing and calling must never throw.
describe("SSR safety", () => {
  it("exports data without touching the DOM", () => {
    expect([...CVD_TYPES]).toContain("protanopia");
  });

  it("createChromafix returns a harmless no-op instance", () => {
    const cf = createChromafix();
    expect(cf.getType()).toBe("off");
    expect(cf.getScheme()).toBe("light");
    expect(() => {
      cf.setType("protanopia");
      cf.setScheme("dark");
      cf.toggleOpen();
      cf.destroy();
    }).not.toThrow();
  });

  it("applyPalette is a no-op", () => {
    expect(() => applyPalette("deuteranopia", { "--c": "primary" })).not.toThrow();
  });
});
