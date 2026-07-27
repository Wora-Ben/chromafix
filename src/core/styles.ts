// Scoped widget styles, injected once. Namespaced under `.chromafix`. Two skins
// (`data-theme="dark"|"light"`) so it stays legible on white or black pages.

export const STYLE_ID = "chromafix-styles";

const CSS = `
.chromafix {
  --cfx-radius: 14px;
  --cfx-offset: 20px;
  --cfx-accent: #4f8cff;
  position: fixed;
  z-index: 2147483000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.4;
}
.chromafix[data-theme="dark"] {
  --cfx-bg: #1c2230;
  --cfx-fg: #f4f6fb;
  --cfx-panel: #232a3a;
  --cfx-hover: rgba(255, 255, 255, 0.08);
  --cfx-line: rgba(255, 255, 255, 0.10);
  --cfx-ring: rgba(255, 255, 255, 0.55);
}
.chromafix[data-theme="light"] {
  --cfx-bg: #ffffff;
  --cfx-fg: #1b2130;
  --cfx-panel: #ffffff;
  --cfx-hover: rgba(0, 0, 0, 0.05);
  --cfx-line: rgba(0, 0, 0, 0.10);
  --cfx-ring: rgba(0, 0, 0, 0.45);
}

.chromafix[data-position="bottom-right"] { bottom: var(--cfx-offset); right: var(--cfx-offset); }
.chromafix[data-position="bottom-left"]  { bottom: var(--cfx-offset); left: var(--cfx-offset); }
.chromafix[data-position="top-right"]    { top: var(--cfx-offset); right: var(--cfx-offset); }
.chromafix[data-position="top-left"]     { top: var(--cfx-offset); left: var(--cfx-offset); }

.chromafix *, .chromafix *::before, .chromafix *::after { box-sizing: border-box; }

.chromafix__toggle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid var(--cfx-line);
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  background: var(--cfx-bg);
  color: var(--cfx-fg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}
.chromafix__toggle:hover { transform: scale(1.06); }
.chromafix__toggle:focus-visible { outline: 3px solid var(--cfx-accent); outline-offset: 3px; }
.chromafix__toggle svg { width: 26px; height: 26px; display: block; }

.chromafix__panel {
  position: absolute;
  width: 240px;
  max-height: min(70vh, 460px);
  overflow-y: auto;
  padding: 14px;
  background: var(--cfx-panel);
  color: var(--cfx-fg);
  border: 1px solid var(--cfx-line);
  border-radius: var(--cfx-radius);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
}
.chromafix[data-position^="bottom"] .chromafix__panel { bottom: calc(100% + 12px); }
.chromafix[data-position^="top"]    .chromafix__panel { top: calc(100% + 12px); }
.chromafix[data-position$="right"]  .chromafix__panel { right: 0; }
.chromafix[data-position$="left"]   .chromafix__panel { left: 0; }
.chromafix__panel[hidden] { display: none; }

.chromafix__title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.6;
}

.chromafix__group { border: 0; margin: 0; padding: 0; display: grid; gap: 1px; }

.chromafix__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  cursor: pointer;
}
.chromafix__option:hover { background: var(--cfx-hover); }
.chromafix__text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.chromafix__hint { font-size: 12px; opacity: 0.55; }
.chromafix__option input {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 2px solid var(--cfx-ring);
  border-radius: 50%;
  display: grid;
  place-content: center;
  flex: none;
}
.chromafix__option input::before {
  content: "";
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.12s ease;
  background: var(--cfx-accent);
}
.chromafix__option input:checked { border-color: var(--cfx-accent); }
.chromafix__option input:checked::before { transform: scale(1); }
.chromafix__option input:focus-visible { outline: 3px solid var(--cfx-accent); outline-offset: 2px; }

.chromafix__sr {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .chromafix__toggle, .chromafix__option input::before { transition: none; }
}
`;

// Instances share one stylesheet, so the last one out removes it. The count
// lives on the element so it dies with it, staying correct even if something
// else removes the element (HMR, a second copy of the module).
function refs(style: HTMLElement): number {
  return Number(style.dataset.refs) || 0;
}

export function ensureStyles(nonce?: string): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(STYLE_ID);
  if (existing) {
    existing.dataset.refs = String(refs(existing) + 1);
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.dataset.refs = "1";
  if (nonce) {
    // The attribute is what CSP reads on insertion; browsers that implement
    // nonce hiding blank it afterwards but leave the property readable.
    style.setAttribute("nonce", nonce);
    style.nonce = nonce;
  }
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function removeStyles(): void {
  if (typeof document === "undefined") return;
  const style = document.getElementById(STYLE_ID);
  if (!style) return;
  const next = refs(style) - 1;
  if (next > 0) style.dataset.refs = String(next);
  else style.remove();
}
