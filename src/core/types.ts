import type { CvdType, Role, Scheme } from "./palettes";

/** A deficiency type to apply, or `"off"`. */
export type ChromafixType = CvdType | "off";

/** Which palette set to draw from. `"auto"` follows `prefers-color-scheme`. */
export type ChromafixScheme = Scheme | "auto";

export type ChromafixPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

/** Widget skin. `"auto"` contrasts the page background. */
export type ChromafixTheme = "auto" | "light" | "dark";

/** Map of a site's CSS custom properties to the palette role each represents. */
export type TokenMap = Record<string, Role>;

/**
 * A visible option label. A plain string is the name shown; an object adds a
 * secondary `hint` (e.g. the clinical term) rendered beneath it.
 */
export type OptionLabel = string | { name: string; hint?: string };

/** User-visible strings. Every field is optional; English is the default. */
export interface ChromafixLabels {
  button: string;
  title: string;
  off: OptionLabel;
  protanopia: OptionLabel;
  protanomaly: OptionLabel;
  deuteranopia: OptionLabel;
  deuteranomaly: OptionLabel;
  tritanopia: OptionLabel;
  tritanomaly: OptionLabel;
  achromatopsia: OptionLabel;
}

export interface ChromafixOptions {
  /** CSS variables to remap, keyed by name → role. Without it nothing recolors. */
  tokens?: TokenMap;
  /** Element the variables are set on. Defaults to `<html>` (`:root`). */
  target?: string | HTMLElement;
  /** Corner for the floating button. Defaults to `"bottom-right"`. */
  position?: ChromafixPosition;
  /** Widget skin. Defaults to `"auto"`. */
  theme?: ChromafixTheme;
  /**
   * Light or dark palettes. Defaults to `"auto"`, which follows
   * `prefers-color-scheme` and keeps following it as the preference changes.
   */
  scheme?: ChromafixScheme;
  /** Selection restored when storage is empty. Defaults to `"off"`. */
  defaultType?: ChromafixType;
  /** localStorage key for the persisted selection. Defaults to `"chromafix:type"`. */
  storageKey?: string;
  /** Override any visible strings (for i18n). */
  labels?: Partial<ChromafixLabels>;
  /**
   * CSP nonce for the injected stylesheet. Required under a `style-src` policy
   * without `'unsafe-inline'`, which would otherwise block it and leave the
   * widget unstyled. Ignored when `headless`, which injects nothing.
   */
  nonce?: string;
  /**
   * Run the engine with no UI of its own: no button, no panel, no injected
   * stylesheet. You render the controls and drive the instance. Defaults to
   * `false`.
   */
  headless?: boolean;
  /** Called whenever the selection changes. */
  onChange?: (type: ChromafixType) => void;
}

export interface ChromafixInstance {
  setType: (type: ChromafixType) => void;
  getType: () => ChromafixType;
  /** Switch palette sets at runtime. */
  setScheme: (scheme: ChromafixScheme) => void;
  /** The scheme currently in effect, with `"auto"` already resolved. */
  getScheme: () => Scheme;
  toggleOpen: () => void;
  destroy: () => void;
}
