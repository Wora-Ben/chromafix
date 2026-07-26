import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyPalette, createChromafix } from "../src/core/engine";
import { PALETTES } from "../src/core/palettes";
import type { TokenMap } from "../src/core/types";

const TOKENS: TokenMap = {
  "--c-bg": "background",
  "--c-text": "text",
  "--c-primary": "primary",
};

const root = document.documentElement;

function reset(): void {
  for (const name in TOKENS) root.style.removeProperty(name);
  document.getElementById("chromafix-styles")?.remove();
  document.querySelectorAll(".chromafix").forEach((n) => n.remove());
  localStorage.clear();
}

beforeEach(reset);
afterEach(reset);

describe("applyPalette", () => {
  it("sets the mapped variables for a type", () => {
    applyPalette("deuteranopia", TOKENS);
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.deuteranopia.primary,
    );
    expect(root.style.getPropertyValue("--c-text")).toBe(
      PALETTES.deuteranopia.text,
    );
  });

  it("removes the variables for 'off'", () => {
    applyPalette("tritanopia", TOKENS);
    applyPalette("off", TOKENS);
    expect(root.style.getPropertyValue("--c-primary")).toBe("");
  });

  it("targets a custom element", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    applyPalette("protanopia", TOKENS, el);
    expect(el.style.getPropertyValue("--c-bg")).toBe(PALETTES.protanopia.background);
    expect(root.style.getPropertyValue("--c-bg")).toBe("");
    el.remove();
  });
});

describe("createChromafix", () => {
  it("mounts the button and defaults to off", () => {
    const cf = createChromafix({ tokens: TOKENS });
    expect(document.querySelector(".chromafix__toggle")).not.toBeNull();
    expect(cf.getType()).toBe("off");
    expect(root.style.getPropertyValue("--c-primary")).toBe("");
    cf.destroy();
  });

  it("applies, persists and reflects a selection", () => {
    const cf = createChromafix({ tokens: TOKENS });
    cf.setType("tritanomaly");
    expect(cf.getType()).toBe("tritanomaly");
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.tritanomaly.primary,
    );
    expect(localStorage.getItem("chromafix:type")).toBe("tritanomaly");
    expect(
      document.querySelector<HTMLInputElement>(".chromafix input:checked")?.value,
    ).toBe("tritanomaly");
    cf.destroy();
  });

  it("restores the stored selection on init", () => {
    localStorage.setItem("chromafix:type", "achromatopsia");
    const cf = createChromafix({ tokens: TOKENS });
    expect(cf.getType()).toBe("achromatopsia");
    expect(root.style.getPropertyValue("--c-text")).toBe(
      PALETTES.achromatopsia.text,
    );
    cf.destroy();
  });

  it("ignores unknown stored values and uses defaultType", () => {
    localStorage.setItem("chromafix:type", "banana");
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    expect(cf.getType()).toBe("protanopia");
    cf.destroy();
  });

  it("clears variables and DOM on destroy", () => {
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    cf.destroy();
    expect(root.style.getPropertyValue("--c-primary")).toBe("");
    expect(document.querySelector(".chromafix")).toBeNull();
    expect(document.getElementById("chromafix-styles")).toBeNull();
  });
});
