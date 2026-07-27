// Defined, colorblind-safe palettes, one per deficiency type. Each maps the
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

/** A resolved palette set. Use `ChromafixScheme` for the `"auto"`-aware input. */
export type Scheme = "light" | "dark";

/** Light palettes. See {@link PALETTES_DARK} for the dark counterparts. */
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
    primary: "#b07500",
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

/**
 * Dark counterparts. Same hue identity per type, with accents lifted so they
 * stay legible on a dark surface.
 */
export const PALETTES_DARK: Record<CvdType, Palette> = {
  protanopia: {
    background: "#0b1016",
    surface: "#141c26",
    border: "#26333f",
    text: "#e7eef6",
    muted: "#a3b3c6",
    primary: "#56b4e9",
  },
  protanomaly: {
    background: "#0a1310",
    surface: "#12201a",
    border: "#23372e",
    text: "#e4f2ea",
    muted: "#9fc0af",
    primary: "#34d399",
  },
  deuteranopia: {
    background: "#12100a",
    surface: "#1e1a11",
    border: "#342e1e",
    text: "#f5efe0",
    muted: "#c2b48d",
    primary: "#f0b429",
  },
  deuteranomaly: {
    background: "#100e09",
    surface: "#1a170f",
    border: "#2e291b",
    text: "#f2ecdd",
    muted: "#bcae89",
    primary: "#d99114",
  },
  tritanopia: {
    background: "#130e0b",
    surface: "#201612",
    border: "#38271f",
    text: "#f8ece5",
    muted: "#cbab9d",
    primary: "#ff8c42",
  },
  tritanomaly: {
    background: "#120c10",
    surface: "#1e1319",
    border: "#35222c",
    text: "#f7e9f1",
    muted: "#cba3b7",
    primary: "#f472b6",
  },
  achromatopsia: {
    background: "#0e0e0e",
    surface: "#1a1a1a",
    border: "#2e2e2e",
    text: "#f2f2f2",
    muted: "#adadad",
    primary: "#ffffff",
  },
};

/** The palette for a type in a resolved scheme. */
export function paletteFor(type: CvdType, scheme: Scheme): Palette {
  return (scheme === "dark" ? PALETTES_DARK : PALETTES)[type];
}
