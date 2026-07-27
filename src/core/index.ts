// chromafix: framework-agnostic colorblind-safe palette switcher.
// Vanilla entry point. For React, import from `chromafix-a11y/react`.

export { applyPalette, createChromafix, DEFAULT_LABELS } from "./engine";
export type { CvdType, Palette, Role, Scheme } from "./palettes";
export { CVD_TYPES, PALETTES, PALETTES_DARK, paletteFor, ROLES } from "./palettes";
export type {
  ChromafixInstance,
  ChromafixLabels,
  ChromafixOptions,
  ChromafixPosition,
  ChromafixScheme,
  ChromafixTheme,
  ChromafixType,
  OptionLabel,
  TokenMap,
} from "./types";
