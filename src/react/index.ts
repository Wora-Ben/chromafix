// chromafix React adapter. `<ColorblindWidget />` mounts the engine in a client
// effect. Requires `react` (a peer dependency).

export { ColorblindWidget } from "./ColorblindWidget";
export type { ColorblindWidgetProps } from "./ColorblindWidget";
export { CVD_TYPES, ROLES, PALETTES } from "../core/palettes";
export type { CvdType, Role, Palette } from "../core/palettes";
export type {
  ChromafixType,
  ChromafixPosition,
  ChromafixTheme,
  ChromafixLabels,
  ChromafixOptions,
  ChromafixInstance,
  TokenMap,
} from "../core/types";
