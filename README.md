<div align="center">

<img src="https://raw.githubusercontent.com/Wora-Ben/chromafix/main/assets/chromafix.png" alt="chromafix colorblind accessibility library" width="640" />

<h1>chromafix</h1>

**A tiny, framework-agnostic colorblind-safe palette switcher.**
Drop a floating button on your site; visitors pick a color-vision-deficiency type
and your whole palette is swapped for one whose colors stay distinguishable for them.

[![CI](https://github.com/Wora-Ben/chromafix/actions/workflows/ci.yml/badge.svg)](https://github.com/Wora-Ben/chromafix/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-555)](./LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-009e73)](./package.json)
[![Types included](https://img.shields.io/badge/types-included-3178c6)](./package.json)

<!-- After the first `npm publish`, add these live badges:
[![npm version](https://img.shields.io/npm/v/chromafix-a11y?color=0072b2)](https://www.npmjs.com/package/chromafix-a11y)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/chromafix-a11y?color=009e73)](https://bundlephobia.com/package/chromafix-a11y)
-->

</div>

---

chromafix doesn't filter pixels. It remaps your **CSS variables**. Selecting a type
sets your color tokens inline on `:root` to a defined safe palette; every element
that reads those variables recolors instantly, and turning it off removes them.
That's the whole engine: **O(1), no DOM walking, no repaint filter.**

- 🎨 **7 deficiency types**, each with its own defined, colorblind-safe palette.
- ⚡ **Zero runtime dependencies**, ~2 KB core, any framework or none.
- 🌗 **Clean on light or dark pages.** The widget auto-picks a contrasting skin.
- ♿ **Exemplary a11y:** keyboard-operable, ARIA-correct, respects `prefers-reduced-motion`.
- ⚛️ **First-class React adapter**, SSR / Next.js App Router safe.
- 🔒 **Fully typed**, ships ESM + CJS + `.d.ts`. **MIT licensed.**

## Install

```sh
npm install chromafix-a11y
```

## Quick start

Your site's colors already live in CSS variables:

```css
:root {
  --brand-bg: #ffffff;
  --brand-text: #1a2c4e;
  --brand-accent: #c2410c;
}
```

Tell chromafix which variable plays which **role**, and it does the rest:

```js
import { createChromafix } from "chromafix-a11y";

createChromafix({
  tokens: {
    "--brand-bg": "background",
    "--brand-text": "text",
    "--brand-accent": "primary",
  },
});
```

Pick **Deuteranopia** and `--brand-accent` becomes a distinguishable orange,
`--brand-text` a safe dark, and so on, across the whole site at once. The choice
is remembered in `localStorage`.

### React / Next.js

```tsx
import { ColorblindWidget } from "chromafix-a11y/react";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ColorblindWidget
        tokens={{
          "--brand-bg": "background",
          "--brand-text": "text",
          "--brand-accent": "primary",
        }}
      />
    </>
  );
}
```

The component is client-only, so it's safe to render from a Server Component.

## How it works

You map each of your CSS variables to one of six semantic **roles**. chromafix keeps
a curated palette for every deficiency type and, on selection, writes the matching
color for each role straight onto the target element's inline style, which always
wins over stylesheet rules. No specificity games, no `!important`.

| Role         | Meaning                          |
| ------------ | -------------------------------- |
| `background` | Page background                  |
| `surface`    | Cards, panels, raised areas      |
| `border`     | Dividers, outlines               |
| `text`       | Primary foreground text          |
| `muted`      | Secondary / de-emphasized text   |
| `primary`    | Accent: links, buttons, brand    |

The seven supported types (accents drawn from the [Okabe-Ito][okabe-ito] safe set):

`protanopia` · `protanomaly` · `deuteranopia` · `deuteranomaly` · `tritanopia` · `tritanomaly` · `achromatopsia`

## Options

| Option        | Type                                                          | Default                    | Description                                              |
| ------------- | ------------------------------------------------------------- | -------------------------- | -------------------------------------------------------- |
| `tokens`      | `Record<string, Role>`                                        | `{}`                       | Your CSS variables to palette roles. Required to recolor. |
| `target`      | `string \| HTMLElement`                                       | `document.documentElement` | Element the variables are set on (`:root`).              |
| `position`    | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"`| `"bottom-right"`           | Corner for the floating button.                          |
| `theme`       | `"auto" \| "light" \| "dark"`                                 | `"auto"`                   | Widget skin. `auto` contrasts the page background.       |
| `defaultType` | `"off" \| CvdType`                                            | `"off"`                    | Selection used when nothing is stored yet.               |
| `storageKey`  | `string`                                                      | `"chromafix:type"`         | `localStorage` key for the remembered choice.            |
| `labels`      | `Partial<ChromafixLabels>`                                    | English                    | Override any visible string (see below).                 |
| `hideButton`  | `boolean`                                                     | `false`                    | Run the engine without the floating button.              |
| `onChange`    | `(type) => void`                                              | none                       | Called whenever the selection changes.                   |

`createChromafix()` returns `{ setType, getType, toggleOpen, destroy }`.

### Labels & i18n

Every visible string is overridable. Each option label is a plain string, or an
`{ name, hint }` object that adds a dimmed subtitle. That's ideal for pairing a
plain-language name with the clinical term, so users who don't know their exact
type can still choose confidently:

```js
createChromafix({
  tokens,
  labels: {
    button: "Accessible colours",
    off: "Off",
    deuteranopia: { name: "Red / green (reduced green)", hint: "Deuteranopia" },
    tritanopia:   { name: "Blue / yellow", hint: "Tritanopia" },
    // …
  },
});
```

## Low-level API

Skip the UI and drive the palette yourself:

```js
import { applyPalette, PALETTES, CVD_TYPES, ROLES } from "chromafix-a11y";

applyPalette("tritanopia", { "--brand-accent": "primary" }); // set
applyPalette("off", { "--brand-accent": "primary" });        // restore

PALETTES.deuteranopia; // { background, surface, border, text, muted, primary }
CVD_TYPES;             // readonly ["protanopia", …]
ROLES;                 // readonly ["background", …]
```

## Accessibility

The control itself is held to the standard it promotes:

- A real `<button>` with `aria-expanded` / `aria-controls` disclosure.
- Options are a native `<fieldset>` radio group, so arrow-key navigation is free.
- **Escape** closes the panel and returns focus to the button; outside-click dismisses.
- High-contrast focus-visible rings; all animation gated behind `prefers-reduced-motion`.

## SSR & bundling

Every DOM, `window`, and `localStorage` access is guarded, and nothing runs at
import time, so importing or calling into chromafix in a Node/SSR context is a safe
no-op. The package is side-effect-free (`"sideEffects": false`) and tree-shakeable,
ships ESM and CJS with type definitions, and lists `react` as an **optional** peer
so vanilla and CDN users install nothing extra.

## Note

chromafix remaps **colors defined through CSS variables**. It can't recolor raster
images or hard-coded inline colors. That's a deliberate trade for being instant,
predictable, and filter-free.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md). A local demo
lives at `examples/vanilla.html`; run `npm run build` first, then open it in a browser.

## License

MIT © [WORA-BEN](https://github.com/Wora-Ben)

[okabe-ito]: https://jfly.uni-koeln.de/color/
