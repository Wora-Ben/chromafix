// Remaps a site's CSS variables to a colorblind-safe palette per type by
// setting them inline on the target, which wins over stylesheet rules.
// SSR-safe: every DOM access is guarded.

import type { Scheme } from "./palettes";
import { CVD_TYPES, paletteFor } from "./palettes";
import { ensureStyles, removeStyles } from "./styles";
import type {
  ChromafixInstance,
  ChromafixLabels,
  ChromafixOptions,
  ChromafixScheme,
  ChromafixTheme,
  ChromafixType,
  TokenMap,
} from "./types";
import { mountWidget } from "./widget";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const DEFAULT_STORAGE_KEY = "chromafix:type";

/** The built-in English strings. Exported so a custom UI can reuse them. */
export const DEFAULT_LABELS: ChromafixLabels = {
  button: "Accessible colors",
  title: "Color adjustment",
  off: "Off",
  protanopia: { name: "Red / green (reduced red)", hint: "Protanopia" },
  protanomaly: { name: "Red / green (reduced red, mild)", hint: "Protanomaly" },
  deuteranopia: { name: "Red / green (reduced green)", hint: "Deuteranopia" },
  deuteranomaly: { name: "Red / green (reduced green, mild)", hint: "Deuteranomaly" },
  tritanopia: { name: "Blue / yellow", hint: "Tritanopia" },
  tritanomaly: { name: "Blue / yellow (mild)", hint: "Tritanomaly" },
  achromatopsia: { name: "No color / grayscale", hint: "Achromatopsia" },
};

const VALID_TYPES: ReadonlySet<ChromafixType> = new Set(["off", ...CVD_TYPES]);

const NOOP_INSTANCE: ChromafixInstance = {
  setType: () => {},
  getType: () => "off",
  setScheme: () => {},
  getScheme: () => "light",
  toggleOpen: () => {},
  destroy: () => {},
};

function darkMedia(): MediaQueryList | null {
  return typeof matchMedia === "function" ? matchMedia(DARK_QUERY) : null;
}

/** Collapse `"auto"` to a concrete scheme using the OS preference. */
function resolveScheme(scheme: ChromafixScheme = "auto"): Scheme {
  if (scheme !== "auto") return scheme;
  return darkMedia()?.matches ? "dark" : "light";
}

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function resolveTarget(target: ChromafixOptions["target"]): HTMLElement {
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target) ?? document.documentElement;
  }
  return target ?? document.documentElement;
}

/** Set (or clear) the palette variables for a type on an element. */
export function applyPalette(
  type: ChromafixType,
  tokens: TokenMap,
  target?: string | HTMLElement,
  scheme: ChromafixScheme = "auto",
): void {
  if (!isBrowser()) return;
  const el = resolveTarget(target);
  if (type === "off") {
    for (const name in tokens) el.style.removeProperty(name);
    return;
  }
  const palette = paletteFor(type, resolveScheme(scheme));
  for (const [name, role] of Object.entries(tokens)) {
    el.style.setProperty(name, palette[role]);
  }
}

/** The skin *contrasts* the page, so a dark page gets the light skin. */
function resolveTheme(theme: ChromafixTheme = "auto"): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  return pageIsDark() ? "light" : "dark";
}

function pageIsDark(): boolean {
  for (const el of [document.body, document.documentElement]) {
    if (!el) continue;
    // Only rgb()/rgba() is parsed; anything else (a wide-gamut color(), a
    // keyword) falls through to the OS preference rather than guessing.
    const match = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
    const channels = match?.[1]?.split(",").map((n) => Number.parseFloat(n));
    if (!channels || channels.length < 3) continue;
    const [r = 0, g = 0, b = 0, a = 1] = channels;
    if (a === 0) continue;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return darkMedia()?.matches ?? false;
}

function readStored(key: string): ChromafixType | null {
  try {
    const value = window.localStorage.getItem(key);
    return value && VALID_TYPES.has(value as ChromafixType)
      ? (value as ChromafixType)
      : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, type: ChromafixType): void {
  try {
    window.localStorage.setItem(key, type);
  } catch {
    /* ignore */
  }
}

/** Mount the engine and, unless `headless`, the floating widget. */
export function createChromafix(options: ChromafixOptions = {}): ChromafixInstance {
  if (!isBrowser()) return NOOP_INSTANCE;

  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const labels = { ...DEFAULT_LABELS, ...options.labels };
  const tokens = options.tokens ?? {};
  const target = resolveTarget(options.target);
  const headless = options.headless ?? false;

  // Headless touches no DOM but the target's variables, so it needs no
  // stylesheet either. That keeps it usable under a strict `style-src` CSP.
  if (!headless) ensureStyles(options.nonce);

  let current: ChromafixType = readStored(storageKey) ?? options.defaultType ?? "off";
  let scheme: ChromafixScheme = options.scheme ?? "auto";
  applyPalette(current, tokens, target, scheme);

  // While on "auto", track the OS preference so an active palette follows it.
  const media = darkMedia();
  const onSchemeChange = () => {
    if (scheme !== "auto") return;
    applyPalette(current, tokens, target, scheme);
    syncTheme();
  };
  media?.addEventListener("change", onSchemeChange);

  const widget = headless
    ? null
    : mountWidget(
        labels,
        options.position ?? "bottom-right",
        resolveTheme(options.theme),
        current,
        { onSelect: setType },
      );

  /**
   * Re-derive the widget skin from the page it now sits on. Applying a palette
   * can flip the page light or dark under the widget, so the skin has to be
   * re-checked after every change. No-op when the caller pinned a `theme`.
   */
  function syncTheme(): void {
    if (options.theme === "light" || options.theme === "dark") return;
    widget?.setTheme(resolveTheme());
  }

  function setType(type: ChromafixType): void {
    if (!VALID_TYPES.has(type)) return;
    current = type;
    applyPalette(type, tokens, target, scheme);
    writeStored(storageKey, type);
    widget?.setChecked(type);
    syncTheme();
    options.onChange?.(type);
  }

  return {
    setType,
    getType: () => current,
    setScheme(next) {
      scheme = next;
      applyPalette(current, tokens, target, scheme);
      syncTheme();
    },
    getScheme: () => resolveScheme(scheme),
    toggleOpen: () => widget?.toggle(),
    destroy() {
      media?.removeEventListener("change", onSchemeChange);
      applyPalette("off", tokens, target);
      widget?.destroy();
      if (!headless) removeStyles();
    },
  };
}
