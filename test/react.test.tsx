import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ColorblindWidget } from "../src/react/ColorblindWidget";

afterEach(() => {
  cleanup();
  document.querySelectorAll(".chromafix").forEach((n) => n.remove());
  document.getElementById("chromafix-styles")?.remove();
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
});
