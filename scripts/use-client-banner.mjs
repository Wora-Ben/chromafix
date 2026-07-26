/**
 * tsup/esbuild strips the `"use client"` directive from bundled output. The
 * React adapter must ship it so frameworks like Next.js (App Router) treat it
 * as a client-component boundary. This restores it on the React entry only —
 * the framework-agnostic core must stay directive-free.
 */
import { readFile, writeFile } from "node:fs/promises";

const files = ["dist/react/index.js", "dist/react/index.cjs"];
const directive = '"use client";\n';

for (const file of files) {
  const code = await readFile(file, "utf8");
  if (/^\s*["']use client["']/.test(code)) continue;
  await writeFile(file, directive + code);
  console.log(`added "use client" to ${file}`);
}
