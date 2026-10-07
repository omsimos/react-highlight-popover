import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  dts: true,
  minify: true,
  sourcemap: false,
  // Hooks and context only work in Client Components.
  banner: { js: '"use client";' },
});
