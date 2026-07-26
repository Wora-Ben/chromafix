# Contributing to chromafix

Thanks for helping make the web more accessible! Contributions of all sizes are
welcome — bug reports, docs, refined palettes, new framework adapters.

## Getting started

```sh
git clone https://github.com/WORA-BEN/chromafix.git
cd chromafix
npm install
npm test
```

## Workflow

1. Open an issue first for anything non-trivial so we can agree on the approach.
2. Branch from `main`.
3. Keep the core dependency-free and SSR-safe (guard every DOM access).
4. Add or update tests (`npm test`) and make sure `npm run typecheck` passes.
5. For anything that changes the on-screen result, sanity-check
   `examples/vanilla.html` in a browser after `npm run build`.
6. Update `CHANGELOG.md` under the unreleased heading.

## Accessibility bar

The widget must stay usable by keyboard and screen readers. If you touch the UI,
verify: tab order, `aria-expanded`/`aria-checked` states, Escape closes the
panel and restores focus, and focus-visible outlines remain intact.

## Releasing (maintainers)

Bump the version, finalize the changelog, then push a `v*` tag — CI publishes to
npm with provenance.

By contributing you agree your work is licensed under the project's MIT license.
