// Defined, colorblind-safe palettes — one per deficiency type. Each maps the
// semantic roles below to colors that stay distinguishable under that type
// (accents drawn from the Okabe-Ito safe set). The engine assigns these to a
// site's CSS variables; nothing is computed at runtime.

export const CVD_TYPES = [
  "protanopia",
  "protanomaly",
  "deuteranopia",
  "deuteranomaly",
  "tritanopia",
  "tritanomaly",
  "achromatopsia",
] as const;

export type CvdType = (typeof CVD_TYPES)[number];

export const ROLES = [
  "background",
  "surface",
  "border",
  "text",
  "muted",
  "primary",
] as const;

export type Role = (typeof ROLES)[number];

export type Palette = Record<Role, string>;

export const PALETTES: Record<CvdType, Palette> = {
  protanopia: {
    background: "#ffffff",
    surface: "#eef3f9",
    border: "#cad8ea",
    text: "#16233b",
    muted: "#51607d",
    primary: "#0072b2",
  },
  protanomaly: {
    background: "#ffffff",
    surface: "#ebf5f0",
    border: "#c3ddd1",
    text: "#123027",
    muted: "#4d6f62",
    primary: "#009e73",
  },
  deuteranopia: {
    background: "#ffffff",
    surface: "#f6f1e7",
    border: "#e0d4bd",
    text: "#2f2711",
    muted: "#736744",
    primary: "#e69f00",
  },
  deuteranomaly: {
    background: "#ffffff",
    surface: "#f6eee4",
    border: "#ddcfb7",
    text: "#2c2410",
    muted: "#6d6242",
    primary: "#c77800",
  },
  tritanopia: {
    background: "#ffffff",
    surface: "#f8edeb",
    border: "#e6c9c3",
    text: "#331915",
    muted: "#855952",
    primary: "#d55e00",
  },
  tritanomaly: {
    background: "#ffffff",
    surface: "#f8ebf2",
    border: "#e6c4d7",
    text: "#321427",
    muted: "#845571",
    primary: "#cc3d8f",
  },
  achromatopsia: {
    background: "#ffffff",
    surface: "#eeeeee",
    border: "#c9c9c9",
    text: "#111111",
    muted: "#6f6f6f",
    primary: "#000000",
  },
};
