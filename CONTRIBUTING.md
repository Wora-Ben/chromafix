# Contributing to chromafix

Thanks for helping make the web more accessible! Contributions of all sizes are
welcome: bug reports, docs, refined palettes, new framework adapters.

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md); by participating
you agree to uphold it. To report a security issue, see our
[security policy](./SECURITY.md). Please don't open a public issue for
vulnerabilities.

## Getting started

```sh
git clone https://github.com/Wora-Ben/chromafix.git
cd chromafix
npm install
npm test
```

## Workflow

1. Open an issue first for anything non-trivial so we can agree on the approach.
2. Branch from `main`.
3. Keep the core dependency-free and SSR-safe (guard every DOM access).
4. Add or update tests (`npm test`) and make sure `npm run typecheck` passes.
5. For anything that changes the on-screen result, sanity-check the demo: serve
   `demo/` (for example `npx serve demo`) and open it in a browser. It loads the
   published package, so point its import at `../dist/index.js` after
   `npm run build` when you need to see unreleased changes.
6. Update `CHANGELOG.md` under the unreleased heading.

## Accessibility bar

The widget must stay usable by keyboard and screen readers. If you touch the UI,
verify: tab order, `aria-expanded`/`aria-checked` states, Escape closes the
panel and restores focus, and focus-visible outlines remain intact.

## Releasing (maintainers)

Bump the version, finalize the changelog, then push a `v*` tag. CI publishes to
npm with provenance.

By contributing you agree your work is licensed under the project's MIT license.
