# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
