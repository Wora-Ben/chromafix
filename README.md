<div align="center">

<img src="https://raw.githubusercontent.com/Wora-Ben/chromafix/main/assets/chromafix.webp" alt="chromafix: colorblind accessibility library" width="640" />

**A framework-agnostic colorblind-safe palette switcher.**
Drop a floating button on your site; visitors pick a color-vision-deficiency type
and your whole palette is swapped for one whose colors stay distinguishable for them.

[![npm version](https://img.shields.io/npm/v/chromafix-a11y?color=0072b2)](https://www.npmjs.com/package/chromafix-a11y) [![minzipped size](https://img.shields.io/bundlephobia/minzip/chromafix-a11y?color=009e73)](https://bundlephobia.com/package/chromafix-a11y) [![CI](https://github.com/Wora-Ben/chromafix/actions/workflows/ci.yml/badge.svg)](https://github.com/Wora-Ben/chromafix/actions/workflows/ci.yml) [![Zero dependencies](https://img.shields.io/badge/dependencies-0-009e73)](https://github.com/Wora-Ben/chromafix/blob/main/package.json) [![License: MIT](https://img.shields.io/badge/license-MIT-555)](https://github.com/Wora-Ben/chromafix/blob/main/LICENSE)

**[▶ Live demo](https://wora-ben.github.io/chromafix/)**

</div>

---

- 🎨 **7 deficiency types**, each with its own palette.
- 🌗 **Light and dark palettes**, following `prefers-color-scheme` or your own toggle.
- ♿ **Keyboard and screen-reader operable**, and respects `prefers-reduced-motion`.
- ⚛️ **React adapter**, safe in SSR and the Next.js App Router.
- 📦 **Zero dependencies**, typed, ESM and CJS.

## Quick start

```sh
npm install chromafix-a11y
```

Your site's colors already live in CSS variables. Tell chromafix which variable
plays which **role**:

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

That's the whole setup. A floating button appears; pick **Deuteranopia** and
`--brand-accent` becomes a distinguishable amber, `--brand-text` a safe dark, and
so on across the site at once. The choice is remembered in `localStorage`.

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

### Other frameworks

The core is plain DOM with no dependencies, so anything that can run code on
mount works. Only React gets a dedicated adapter; everywhere else you call
`createChromafix()` yourself and `destroy()` on teardown.

| Framework                       | Integration                                       |
| ------------------------------- | ------------------------------------------------- |
| React, Next.js                  | `<ColorblindWidget />` from `chromafix-a11y/react` |
| Vue, Svelte, Solid, Angular 20+ | `createChromafix()` in your mount hook             |
| Vanilla, CDN                    | `createChromafix()` once the page has loaded       |

```js
// Vue
onMounted(() => {
  chromafix = createChromafix({ tokens });
});
onUnmounted(() => chromafix.destroy());
```

Angular has one extra consideration, covered in
[Bring your own UI](#bring-your-own-ui): render the controls in your own
template so clicks stay inside change detection.

Importing `chromafix-a11y/react` needs a resolver that reads `exports`, which
means Angular 20+, or any current Vite, webpack, Next.js or Rollup setup. The
core entry has no such requirement.

## How it works

chromafix doesn't filter pixels. You map each of your CSS variables to one of six
semantic **roles**, and on selection it writes the matching color for each role
straight onto the target element's inline style, which always wins over
stylesheet rules. No DOM walking, no repaint filter, no `!important`.

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
| `scheme`      | `"auto" \| "light" \| "dark"`                                 | `"auto"`                   | Palette set. See [Dark mode](#dark-mode).                |
| `defaultType` | `"off" \| CvdType`                                            | `"off"`                    | Selection used when nothing is stored yet.               |
| `storageKey`  | `string`                                                      | `"chromafix:type"`         | `localStorage` key for the remembered choice.            |
| `labels`      | `Partial<ChromafixLabels>`                                    | English                    | Override any visible string. See [Labels and i18n](#labels-and-i18n). |
| `nonce`       | `string`                                                      | none                       | Nonce for the injected stylesheet. See [CSP](#content-security-policy). |
| `headless`    | `boolean`                                                     | `false`                    | No UI at all. See [Bring your own UI](#bring-your-own-ui). |
| `onChange`    | `(type) => void`                                              | none                       | Called whenever the selection changes.                   |

`createChromafix()` returns `{ setType, getType, setScheme, getScheme, toggleOpen, destroy }`.

## Dark mode

Every type has a light and a dark palette. On `"auto"` the library follows the
OS `prefers-color-scheme` and keeps tracking it, so an active palette flips
with the system. If your site has its own theme switch, drive it directly:

```js
const chromafix = createChromafix({ tokens });

darkToggle.addEventListener("click", () => {
  chromafix.setScheme(isDark ? "dark" : "light");
});

chromafix.getScheme(); // "light" | "dark", with "auto" already resolved
```

The palette is written inline, so it beats your stylesheet. Without `setScheme`,
a site theme toggle does nothing while a type is active.

## Labels and i18n

Every visible string is overridable. Each option label is a plain string, or an
`{ name, hint }` object that adds a dimmed subtitle. Use the subtitle for the
clinical term, so someone who doesn't know their exact type can still choose:

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

## Content Security Policy

The widget injects one `<style>` element. Under a `style-src` policy without
`'unsafe-inline'` the browser blocks it and the widget mounts unstyled: the
button and radios are all there, they have simply lost their layout.

If that's your setup, pass the nonce for the current response:

```js
createChromafix({ tokens, nonce: requestNonce });
```

The nonce comes from wherever your server builds the CSP header. In Next.js
that's middleware:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    "Content-Security-Policy",
    `style-src 'self' 'nonce-${nonce}'`,
  );
  return response;
}
```

```jsx
// app/layout.tsx
const nonce = (await headers()).get("x-nonce");
return <ColorblindWidget tokens={tokens} nonce={nonce} />;
```

Only the widget's stylesheet needs this. Palettes are written with
`style.setProperty`, which CSP does not police, so `applyPalette` and
`headless: true` work under any policy.

## Bring your own UI

Set `headless: true` and chromafix renders nothing at all: no button, no panel,
no injected stylesheet. It keeps the engine, `localStorage` persistence and
scheme tracking, and you drive it from your own controls. Useful when you have a
design system to match, or a strict `style-src` CSP that forbids our stylesheet.

```js
import { createChromafix, CVD_TYPES, DEFAULT_LABELS } from "chromafix-a11y";

const chromafix = createChromafix({ headless: true, tokens });

for (const type of ["off", ...CVD_TYPES]) {
  myRadioGroup.add(DEFAULT_LABELS[type], () => chromafix.setType(type));
}
```

Angular, where the widget's listeners would otherwise fire outside change
detection:

```ts
export class ThemeComponent implements OnInit, OnDestroy {
  types = ["off", ...CVD_TYPES];
  labels = DEFAULT_LABELS;
  private cf!: ChromafixInstance;

  ngOnInit() {
    this.cf = createChromafix({ headless: true, tokens: this.tokens });
  }
  select(type: ChromafixType) {
    this.cf.setType(type);
  }
  ngOnDestroy() {
    this.cf.destroy();
  }
}
```

Because your own template renders the controls, every click already runs inside
Angular's zone, and Vue, Svelte and Solid work the same way.

## Accessibility

The widget's own controls:

- A real `<button>` with `aria-expanded` / `aria-controls` disclosure.
- Options are a native `<fieldset>` radio group, so arrow-key navigation is free.
- **Escape** closes the panel and returns focus to the button; outside-click dismisses.
- High-contrast focus-visible rings; all animation gated behind `prefers-reduced-motion`.

## Low-level API

Skip the UI and drive the palette yourself:

```js
import {
  applyPalette,
  paletteFor,
  PALETTES,
  PALETTES_DARK,
  CVD_TYPES,
  ROLES,
} from "chromafix-a11y";

const tokens = { "--brand-accent": "primary" };

applyPalette("tritanopia", tokens);                    // apply
applyPalette("tritanopia", tokens, undefined, "dark"); // apply the dark set
applyPalette("off", tokens);                           // clear

PALETTES.deuteranopia;      // { background, surface, border, text, muted, primary }
PALETTES_DARK.deuteranopia; // the dark counterpart
paletteFor("deuteranopia", "dark");
CVD_TYPES;                  // readonly ["protanopia", …]
ROLES;                      // readonly ["background", …]
```

## SSR and bundling

Every DOM, `window`, and `localStorage` access is guarded and nothing runs at
import time, so importing or calling chromafix in a Node/SSR context is a no-op.

- Side-effect-free (`"sideEffects": false`) and tree-shakeable.
- Ships ESM and CJS, each with matching type definitions.
- `react` is an **optional** peer, so vanilla and CDN users install nothing extra.

Resolution is verified against `moduleResolution: "bundler"` and `"node16"` on
every build. Legacy `"node"` resolution is not supported, so the subpath export
needs Angular 20+, or any current Vite, webpack, Next.js or Rollup setup.

## Limitations

chromafix remaps **colors defined through CSS variables**. It cannot recolor
raster images, or colors hard-coded in stylesheets and `style` attributes.

## Contributing

Contributions are welcome. See
[CONTRIBUTING.md](https://github.com/Wora-Ben/chromafix/blob/main/CONTRIBUTING.md). The page in
`demo/` is what gets published to GitHub Pages; serve that folder to run it locally.

## License

MIT © [WORA-BEN](https://github.com/Wora-Ben)

[okabe-ito]: https://jfly.uni-koeln.de/color/
