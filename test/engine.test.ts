import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyPalette, createChromafix } from "../src/core/engine";
import { PALETTES, PALETTES_DARK } from "../src/core/palettes";
import type { TokenMap } from "../src/core/types";

const TOKENS: TokenMap = {
  "--c-bg": "background",
  "--c-text": "text",
  "--c-primary": "primary",
};

const root = document.documentElement;
const realMatchMedia = window.matchMedia;

/** Replace `matchMedia` with one we can flip, so `"auto"` is testable. */
function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches,
    addEventListener: (_: string, fn: () => void) => void listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => void listeners.delete(fn),
  };
  window.matchMedia = (() => mql) as unknown as typeof window.matchMedia;
  return {
    listeners,
    emit(next: boolean) {
      mql.matches = next;
      for (const fn of listeners) fn();
    },
  };
}

function reset(): void {
  for (const name in TOKENS) root.style.removeProperty(name);
  document.getElementById("chromafix-styles")?.remove();
  for (const node of document.querySelectorAll(".chromafix")) node.remove();
  localStorage.clear();
  document.body.style.removeProperty("background-color");
  window.matchMedia = realMatchMedia;
}

beforeEach(reset);
afterEach(reset);

describe("applyPalette", () => {
  it("sets the mapped variables for a type", () => {
    applyPalette("deuteranopia", TOKENS);
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.deuteranopia.primary,
    );
    expect(root.style.getPropertyValue("--c-text")).toBe(PALETTES.deuteranopia.text);
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
    expect(root.style.getPropertyValue("--c-text")).toBe(PALETTES.achromatopsia.text);
    cf.destroy();
  });

  it("ignores unknown stored values and uses defaultType", () => {
    localStorage.setItem("chromafix:type", "banana");
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    expect(cf.getType()).toBe("protanopia");
    cf.destroy();
  });

  it("keeps the shared stylesheet until the last instance is destroyed", () => {
    const a = createChromafix({ tokens: TOKENS });
    const b = createChromafix({ tokens: TOKENS });
    a.destroy();
    expect(document.getElementById("chromafix-styles")).not.toBeNull();
    b.destroy();
    expect(document.getElementById("chromafix-styles")).toBeNull();
  });

  it("clears variables and DOM on destroy", () => {
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    cf.destroy();
    expect(root.style.getPropertyValue("--c-primary")).toBe("");
    expect(document.querySelector(".chromafix")).toBeNull();
    expect(document.getElementById("chromafix-styles")).toBeNull();
  });
});

describe("nonce", () => {
  it("stamps the injected stylesheet so a strict CSP accepts it", () => {
    const cf = createChromafix({ tokens: TOKENS, nonce: "test-nonce" });
    const style = document.getElementById("chromafix-styles");
    expect(style?.nonce).toBe("test-nonce");
    cf.destroy();
  });

  it("leaves the stylesheet unstamped when none is given", () => {
    const cf = createChromafix({ tokens: TOKENS });
    expect(document.getElementById("chromafix-styles")?.nonce).toBeFalsy();
    cf.destroy();
  });

  it("injects nothing to stamp when headless", () => {
    const cf = createChromafix({ tokens: TOKENS, nonce: "test-nonce", headless: true });
    expect(document.getElementById("chromafix-styles")).toBeNull();
    cf.destroy();
  });
});

// The "bring your own UI" contract: nothing is touched but the target's
// variables.
describe("headless", () => {
  it("adds no DOM of its own but still recolors", () => {
    const cf = createChromafix({ tokens: TOKENS, headless: true });
    cf.setType("tritanopia");

    expect(document.querySelector(".chromafix")).toBeNull();
    expect(document.getElementById("chromafix-styles")).toBeNull();
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.tritanopia.primary,
    );
    cf.destroy();
  });

  it("still drives type, scheme, persistence and onChange", () => {
    const seen: string[] = [];
    const cf = createChromafix({
      tokens: TOKENS,
      headless: true,
      scheme: "light",
      onChange: (type) => seen.push(type),
    });

    cf.setType("protanopia");
    cf.setScheme("dark");

    expect(seen).toEqual(["protanopia"]);
    expect(cf.getType()).toBe("protanopia");
    expect(cf.getScheme()).toBe("dark");
    expect(localStorage.getItem("chromafix:type")).toBe("protanopia");
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES_DARK.protanopia.background,
    );
    cf.destroy();
  });

  it("toggleOpen is a no-op with no panel to open", () => {
    const cf = createChromafix({ tokens: TOKENS, headless: true });
    expect(() => cf.toggleOpen()).not.toThrow();
    cf.destroy();
  });

  it("leaves a stylesheet another instance is using alone", () => {
    const withUi = createChromafix({ tokens: TOKENS });
    const bare = createChromafix({ tokens: TOKENS, headless: true });
    bare.destroy();
    expect(document.getElementById("chromafix-styles")).not.toBeNull();
    withUi.destroy();
    expect(document.getElementById("chromafix-styles")).toBeNull();
  });
});

describe("scheme", () => {
  it("applies the requested set", () => {
    applyPalette("tritanopia", TOKENS, undefined, "dark");
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES_DARK.tritanopia.background,
    );
  });

  it("resolves 'auto' from the OS preference", () => {
    stubMatchMedia(true);
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    expect(cf.getScheme()).toBe("dark");
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES_DARK.protanopia.background,
    );
    cf.destroy();
  });

  it("swaps sets at runtime without changing the type", () => {
    const cf = createChromafix({
      tokens: TOKENS,
      defaultType: "deuteranopia",
      scheme: "light",
    });
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES.deuteranopia.background,
    );

    cf.setScheme("dark");
    expect(cf.getType()).toBe("deuteranopia");
    expect(cf.getScheme()).toBe("dark");
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES_DARK.deuteranopia.background,
    );
    cf.destroy();
  });

  it("follows the OS preference while on 'auto' only", () => {
    const media = stubMatchMedia(false);
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });

    media.emit(true);
    expect(root.style.getPropertyValue("--c-bg")).toBe(
      PALETTES_DARK.protanopia.background,
    );

    // Pinning a scheme opts out of the OS preference.
    cf.setScheme("light");
    media.emit(false);
    media.emit(true);
    expect(root.style.getPropertyValue("--c-bg")).toBe(PALETTES.protanopia.background);
    cf.destroy();
  });

  // The skin is picked to contrast the page, so it has to be re-derived after
  // a change rather than frozen at mount.
  it("re-skins the widget when the page flips under it", () => {
    const cf = createChromafix({ tokens: TOKENS });
    const widget = document.querySelector<HTMLElement>(".chromafix");
    expect(widget?.dataset.theme).toBe("dark");

    document.body.style.backgroundColor = "#101010";
    cf.setType("protanopia");
    expect(widget?.dataset.theme).toBe("light");

    document.body.style.backgroundColor = "#ffffff";
    cf.setScheme("light");
    expect(widget?.dataset.theme).toBe("dark");
    cf.destroy();
  });

  it("leaves a pinned theme alone", () => {
    const cf = createChromafix({ tokens: TOKENS, theme: "dark" });
    const widget = document.querySelector<HTMLElement>(".chromafix");
    document.body.style.backgroundColor = "#101010";
    cf.setType("protanopia");
    expect(widget?.dataset.theme).toBe("dark");
    cf.destroy();
  });

  it("drops the media listener on destroy", () => {
    const media = stubMatchMedia(false);
    const cf = createChromafix({ tokens: TOKENS, defaultType: "protanopia" });
    expect(media.listeners.size).toBe(1);
    cf.destroy();
    expect(media.listeners.size).toBe(0);
  });
});
