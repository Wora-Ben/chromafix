// chromafix — framework-agnostic colorblind-safe palette switcher.
// Vanilla entry point. For React, import from `chromafix/react`.

export { createChromafix, applyPalette } from "./engine";
export { CVD_TYPES, ROLES, PALETTES } from "./palettes";
export type { CvdType, Role, Palette } from "./palettes";
export type {
  ChromafixType,
  ChromafixPosition,
  ChromafixTheme,
  ChromafixLabels,
  ChromafixOptions,
  ChromafixInstance,
  TokenMap,
} from "./types";
