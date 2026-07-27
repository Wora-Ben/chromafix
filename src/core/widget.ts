// Floating disclosure button revealing a radio group of vision types. Real
// <input type="radio"> in a <fieldset> gives keyboard nav for free; the panel
// is a non-modal disclosure closed by Escape or outside-click.

import type { ChromafixLabels, ChromafixPosition, ChromafixType } from "./types";

const OPTION_ORDER: ChromafixType[] = [
  "off",
  "protanopia",
  "protanomaly",
  "deuteranopia",
  "deuteranomaly",
  "tritanopia",
  "tritanomaly",
  "achromatopsia",
];

const ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path fill="currentColor" d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>' +
  "</svg>";

export interface WidgetCallbacks {
  onSelect: (type: ChromafixType) => void;
}

export interface WidgetHandle {
  setChecked: (type: ChromafixType) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggle: () => void;
  destroy: () => void;
}

let uidCounter = 0;

export function mountWidget(
  labels: ChromafixLabels,
  position: ChromafixPosition,
  theme: "light" | "dark",
  initial: ChromafixType,
  callbacks: WidgetCallbacks,
): WidgetHandle {
  const uid = `chromafix-${++uidCounter}`;
  const panelId = `${uid}-panel`;

  const root = document.createElement("div");
  root.className = "chromafix";
  root.dataset.position = position;
  root.dataset.theme = theme;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "chromafix__toggle";
  toggle.setAttribute("aria-label", labels.button);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", panelId);
  toggle.innerHTML = ICON;

  const panel = document.createElement("div");
  panel.className = "chromafix__panel";
  panel.id = panelId;
  panel.hidden = true;

  const title = document.createElement("p");
  title.className = "chromafix__title";
  title.textContent = labels.title;

  const fieldset = document.createElement("fieldset");
  fieldset.className = "chromafix__group";
  const legend = document.createElement("legend");
  legend.className = "chromafix__sr";
  legend.textContent = labels.title;
  fieldset.appendChild(legend);

  const inputs = new Map<ChromafixType, HTMLInputElement>();
  for (const type of OPTION_ORDER) {
    const label = document.createElement("label");
    label.className = "chromafix__option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = uid;
    input.value = type;
    input.checked = type === initial;
    input.addEventListener("change", () => callbacks.onSelect(type));

    const raw = labels[type];
    const { name, hint } =
      typeof raw === "string" ? { name: raw, hint: undefined } : raw;

    const text = document.createElement("span");
    text.className = "chromafix__text";
    const nameEl = document.createElement("span");
    nameEl.className = "chromafix__name";
    nameEl.textContent = name;
    text.appendChild(nameEl);
    if (hint) {
      const hintEl = document.createElement("span");
      hintEl.className = "chromafix__hint";
      hintEl.textContent = hint;
      text.appendChild(hintEl);
    }

    label.append(input, text);
    fieldset.appendChild(label);
    inputs.set(type, input);
  }

  panel.append(title, fieldset);
  root.append(toggle, panel);

  let open = false;

  function currentChecked(): ChromafixType {
    for (const [type, input] of inputs) if (input.checked) return type;
    return "off";
  }

  function setOpen(next: boolean): void {
    open = next;
    panel.hidden = !next;
    toggle.setAttribute("aria-expanded", String(next));
    if (next) inputs.get(currentChecked())?.focus();
  }

  function onDocPointer(event: MouseEvent): void {
    if (open && !root.contains(event.target as Node)) setOpen(false);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && open) {
      setOpen(false);
      toggle.focus();
    }
  }

  toggle.addEventListener("click", () => setOpen(!open));
  document.addEventListener("pointerdown", onDocPointer);
  root.addEventListener("keydown", onKeydown);

  (document.body ?? document.documentElement).appendChild(root);

  return {
    setChecked(type) {
      const input = inputs.get(type);
      if (input) input.checked = true;
    },
    setTheme(next) {
      root.dataset.theme = next;
    },
    toggle: () => setOpen(!open),
    destroy() {
      document.removeEventListener("pointerdown", onDocPointer);
      root.removeEventListener("keydown", onKeydown);
      root.remove();
    },
  };
}
