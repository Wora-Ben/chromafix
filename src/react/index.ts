// chromafix React adapter. `<ColorblindWidget />` mounts the engine in a client
// effect. Requires `react` (a peer dependency).

export { applyPalette, createChromafix, DEFAULT_LABELS } from "../core/engine";
export type { CvdType, Palette, Role, Scheme } from "../core/palettes";
export {
  CVD_TYPES,
  PALETTES,
  PALETTES_DARK,
  paletteFor,
  ROLES,
} from "../core/palettes";
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
} from "../core/types";
export type { ColorblindWidgetProps } from "./ColorblindWidget";
export { ColorblindWidget } from "./ColorblindWidget";
