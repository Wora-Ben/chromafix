"use client";

import { useEffect, useRef } from "react";
import { createChromafix } from "../core/engine";
import type { ChromafixOptions } from "../core/types";

/** Client-only wrapper; mounts the widget in an effect and renders nothing. */
export type ColorblindWidgetProps = ChromafixOptions;

export function ColorblindWidget(props: ColorblindWidgetProps): null {
  // Keep onChange current without remounting when its identity changes.
  const onChange = useRef(props.onChange);
  onChange.current = props.onChange;

  const {
    tokens,
    target,
    position,
    theme,
    scheme,
    defaultType,
    storageKey,
    nonce,
    headless,
    labels,
  } = props;

  // tokens and labels are object literals, usually written inline at the call
  // site, so depending on their identity would remount the widget every single
  // render. The deps below compare them by value instead.
  // biome-ignore lint/correctness/useExhaustiveDependencies: compared by value
  useEffect(() => {
    const inst = createChromafix({
      tokens,
      target,
      position,
      theme,
      scheme,
      defaultType,
      storageKey,
      nonce,
      headless,
      labels,
      onChange: (type) => onChange.current?.(type),
    });
    return () => inst.destroy();
  }, [
    JSON.stringify(tokens),
    target,
    position,
    theme,
    scheme,
    defaultType,
    storageKey,
    nonce,
    headless,
    JSON.stringify(labels),
  ]);

  return null;
}
