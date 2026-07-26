// Remaps a site's CSS variables to a colorblind-safe palette per type by
// setting them inline on the target (inline wins over stylesheet rules, so no
// specificity games). SSR-safe: every DOM access is guarded.

import { PALETTES } from "./palettes";
import { ensureStyles, removeStyles } from "./styles";
import { mountWidget } from "./widget";
import type {
  ChromafixInstance,
  ChromafixLabels,
  ChromafixOptions,
  ChromafixTheme,
  ChromafixType,
  TokenMap,
} from "./types";

const DEFAULT_STORAGE_KEY = "chromafix:type";

const DEFAULT_LABELS: ChromafixLabels = {
  button: "Accessible colors",
  title: "Color adjustment",
  off: "Off",
  protanopia: { name: "Red–green (reduced red)", hint: "Protanopia" },
  protanomaly: { name: "Red–green (reduced red, mild)", hint: "Protanomaly" },
  deuteranopia: { name: "Red–green (reduced green)", hint: "Deuteranopia" },
  deuteranomaly: { name: "Red–green (reduced green, mild)", hint: "Deuteranomaly" },
  tritanopia: { name: "Blue–yellow", hint: "Tritanopia" },
  tritanomaly: { name: "Blue–yellow (mild)", hint: "Tritanomaly" },
  achromatopsia: { name: "No color / grayscale", hint: "Achromatopsia" },
};

const VALID_TYPES: ReadonlySet<ChromafixType> = new Set([
  "off",
  ...(Object.keys(PALETTES) as ChromafixType[]),
]);

const NOOP_INSTANCE: ChromafixInstance = {
  setType: () => {},
  getType: () => "off",
  toggleOpen: () => {},
  destroy: () => {},
};

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
): void {
  if (!isBrowser()) return;
  const el = resolveTarget(target);
  const palette = type === "off" ? null : PALETTES[type];
  for (const name in tokens) {
    if (palette) el.style.setProperty(name, palette[tokens[name]]);
    else el.style.removeProperty(name);
  }
}

function resolveTheme(theme: ChromafixTheme = "auto"): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  return pageIsDark() ? "light" : "dark";
}

function pageIsDark(): boolean {
  for (const el of [document.body, document.documentElement]) {
    if (!el) continue;
    const match = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!match) continue;
    const [r, g, b, a = 1] = match[1].split(",").map((n) => parseFloat(n));
    if (a === 0) continue;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }
  return typeof matchMedia === "function"
    ? matchMedia("(prefers-color-scheme: dark)").matches
    : false;
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

/** Mount the engine and (unless hidden) the floating widget. */
export function createChromafix(options: ChromafixOptions = {}): ChromafixInstance {
  if (!isBrowser()) return NOOP_INSTANCE;

  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const labels = { ...DEFAULT_LABELS, ...options.labels };
  const tokens = options.tokens ?? {};
  const target = resolveTarget(options.target);

  ensureStyles();

  let current: ChromafixType =
    readStored(storageKey) ?? options.defaultType ?? "off";
  applyPalette(current, tokens, target);

  const widget = options.hideButton
    ? null
    : mountWidget(
        labels,
        options.position ?? "bottom-right",
        resolveTheme(options.theme),
        current,
        { onSelect: (type) => setType(type) },
      );

  function setType(type: ChromafixType): void {
    if (!VALID_TYPES.has(type)) return;
    current = type;
    applyPalette(type, tokens, target);
    writeStored(storageKey, type);
    widget?.setChecked(type);
    options.onChange?.(type);
  }

  return {
    setType,
    getType: () => current,
    toggleOpen: () => widget?.toggle(),
    destroy() {
      applyPalette("off", tokens, target);
      widget?.destroy();
      removeStyles();
    },
  };
}
