import { cleanup, render } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { PALETTES } from "../src/core/palettes";
import { ColorblindWidget } from "../src/react/ColorblindWidget";

const TOKENS = { "--c-primary": "primary" } as const;
const root = document.documentElement;

afterEach(() => {
  cleanup();
  for (const node of document.querySelectorAll(".chromafix")) node.remove();
  document.getElementById("chromafix-styles")?.remove();
  root.style.removeProperty("--c-primary");
  localStorage.clear();
});

describe("<ColorblindWidget />", () => {
  it("mounts the widget into the document", () => {
    render(<ColorblindWidget />);
    expect(document.querySelector(".chromafix__toggle")).not.toBeNull();
  });

  it("removes the widget on unmount", () => {
    const { unmount } = render(<ColorblindWidget />);
    unmount();
    expect(document.querySelector(".chromafix")).toBeNull();
  });

  it("forwards labels to the button", () => {
    render(<ColorblindWidget labels={{ button: "Vision des couleurs" }} />);
    const toggle = document.querySelector(".chromafix__toggle");
    expect(toggle?.getAttribute("aria-label")).toBe("Vision des couleurs");
  });

  it("drives the engine with no DOM of its own when headless", () => {
    render(
      <ColorblindWidget
        headless
        scheme="light"
        defaultType="tritanopia"
        tokens={TOKENS}
      />,
    );
    expect(document.querySelector(".chromafix")).toBeNull();
    expect(document.getElementById("chromafix-styles")).toBeNull();
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.tritanopia.primary,
    );
  });
});

// StrictMode runs effects mount/cleanup/mount in development, which is exactly
// the sequence that leaks a duplicate widget or tears out a shared stylesheet.
describe("StrictMode", () => {
  it("leaves exactly one widget and one stylesheet", () => {
    render(
      <StrictMode>
        <ColorblindWidget />
      </StrictMode>,
    );
    expect(document.querySelectorAll(".chromafix")).toHaveLength(1);
    expect(document.querySelectorAll("#chromafix-styles")).toHaveLength(1);
  });

  it("keeps the widget styled after the remount", () => {
    render(
      <StrictMode>
        <ColorblindWidget />
      </StrictMode>,
    );
    expect(document.getElementById("chromafix-styles")).not.toBeNull();
    expect(document.querySelector(".chromafix__toggle")).not.toBeNull();
  });

  it("still applies the palette after the remount", () => {
    render(
      <StrictMode>
        <ColorblindWidget scheme="light" defaultType="tritanopia" tokens={TOKENS} />
      </StrictMode>,
    );
    expect(root.style.getPropertyValue("--c-primary")).toBe(
      PALETTES.tritanopia.primary,
    );
  });

  it("cleans up completely on unmount", () => {
    const { unmount } = render(
      <StrictMode>
        <ColorblindWidget tokens={TOKENS} defaultType="tritanopia" />
      </StrictMode>,
    );
    unmount();
    expect(document.querySelector(".chromafix")).toBeNull();
    expect(document.getElementById("chromafix-styles")).toBeNull();
    expect(root.style.getPropertyValue("--c-primary")).toBe("");
  });

  it("keeps two mounted widgets independent", () => {
    render(
      <StrictMode>
        <ColorblindWidget />
        <ColorblindWidget position="top-left" />
      </StrictMode>,
    );
    expect(document.querySelectorAll(".chromafix")).toHaveLength(2);
    expect(document.querySelectorAll("#chromafix-styles")).toHaveLength(1);
  });
});
