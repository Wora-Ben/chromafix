import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/core/index.ts",
    "react/index": "src/react/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  target: "es2020",
  // React is a peer dependency — never bundle it.
  external: ["react", "react-dom"],
});
