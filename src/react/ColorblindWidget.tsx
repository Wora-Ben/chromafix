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
    defaultType,
    storageKey,
    hideButton,
    labels,
  } = props;

  useEffect(() => {
    const inst = createChromafix({
      tokens,
      target,
      position,
      theme,
      defaultType,
      storageKey,
      hideButton,
      labels,
      onChange: (type) => onChange.current?.(type),
    });
    return () => inst.destroy();
    // tokens/labels compared by value to tolerate inline literals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(tokens),
    target,
    position,
    theme,
    defaultType,
    storageKey,
    hideButton,
    JSON.stringify(labels),
  ]);

  return null;
}
