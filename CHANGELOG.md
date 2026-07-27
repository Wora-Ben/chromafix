# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-27

### Added

- **Dark palettes.** Every deficiency type now has a dark counterpart in
  `PALETTES_DARK`, alongside `paletteFor(type, scheme)`.
- `scheme: "auto" | "light" | "dark"` option, plus `setScheme` / `getScheme` on
  the instance. On `"auto"` the palette follows `prefers-color-scheme` and keeps
  tracking it while mounted.
- `applyPalette` accepts a fourth `scheme` argument.
- **`headless: true`**, for driving the engine from your own UI. It renders no
  button, no panel and injects no stylesheet, while keeping persistence and
  scheme tracking. Works under a strict `style-src` CSP, and in Angular, Vue,
  Svelte or Solid every interaction stays inside the framework's own rendering.
- **`nonce`**, for sites running a `style-src` policy without `'unsafe-inline'`.
  Such a policy blocked the injected stylesheet and left the widget mounted but
  unstyled; passing the per-request nonce makes it acceptable to the browser.
  Palette writes were never affected, since CSP does not police CSSOM.
- `DEFAULT_LABELS` is exported so a custom UI can reuse the built-in strings.
- `OptionLabel` is exported; it was reachable through `ChromafixLabels` but
  could not be named.

### Internal

- Lint and formatting are enforced by [Biome](https://biomejs.dev), wired into
  CI on every push and pull request.
- `npm run verify:package` runs [publint](https://publint.dev) and
  [are-the-types-wrong](https://arethetypeswrong.github.io) against the packed
  tarball, in CI and before every release. Resolution is verified for `node16`
  and `bundler`; legacy `moduleResolution: "node"` is out of scope.
- `esbuild` pinned past GHSA-g7r4-m6w7-qqqr via an override, clearing the audit.
  Build tooling only; it was never part of the published package.
- Dropped the legacy `module` field. Bundlers read `exports` in preference to it,
  so it had no effect on any toolchain the package supports.
- `noUncheckedIndexedAccess` is on, which caught unchecked index reads in the
  palette writer and in the page-darkness probe.
- React StrictMode's double mount is covered: one widget, one stylesheet, palette
  applied, and full teardown on unmount.

### Changed

- Default option labels read `Red / green` instead of using an en dash, matching
  the documented examples and staying ASCII.

### Removed

- **Breaking:** `hideButton` is renamed to `headless`, with no alias. It never
  only hid the button, it turned off the whole UI layer, and the new name says
  so. Rename the option at your call site.

### Fixed

- **Types resolved as ESM for CJS consumers.** The `exports` map declared one
  top-level `types`, so `require("chromafix-a11y")` was handed `.d.ts` instead of
  the `.d.cts` the package ships. Types are now declared per condition.
- The no-UI mode injected the widget stylesheet it had no use for, which also
  made it fail under a strict `style-src` CSP for no reason.
- A site's dark-mode toggle no longer has zero effect while a type is active.
  The palette is written inline, so it beat any stylesheet rule the toggle
  flipped; `setScheme` is the supported way to keep the two in sync.
- The `deuteranopia` light accent was `#e69f00`, only 2.25:1 against its own
  background. Darkened to `#b07500` (3.90:1) to clear WCAG 1.4.11. Palettes are
  now contrast-tested in CI.
- The widget skin was resolved once at mount, so it could end up dark on a page
  a palette had just turned dark. It is now re-derived after every change, and
  still left alone when `theme` is pinned.
- Destroying one instance removed the stylesheet shared by any others. The
  stylesheet is now refcounted and removed only by the last instance out.

## [0.1.0] - 2026-07-26

### Added

- Initial release.
- Framework-agnostic core (`chromafix-a11y`): `createChromafix`, `applyPalette`,
  `CVD_TYPES`, `ROLES`, `PALETTES`.
- Colorblind-safe **palette switching**: each of the seven deficiency types
  (protanopia, protanomaly, deuteranopia, deuteranomaly, tritanopia,
  tritanomaly, achromatopsia) has a defined safe palette that is applied by
  remapping the site's CSS variables inline on `:root`, with no pixel filter.
- Accessible floating widget: disclosure button + radio group, full keyboard
  support, `prefers-reduced-motion` aware, scoped self-injected styles.
- `theme: "auto" | "light" | "dark"`: the widget auto-picks a skin that
  contrasts a light or dark page.
- Choice persisted to `localStorage`; i18n via `labels`.
- React adapter (`chromafix-a11y/react`): SSR-safe `<ColorblindWidget />`.
