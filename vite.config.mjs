// Builds the extension's two entry points, one per run: the renderer with
// `vite build`, the main entry with `vite build --mode main`.
// Adapted from freelensapp/freelens-example-extension (MIT).

import { builtinModules, isBuiltin } from "node:module";
import react from "@vitejs/plugin-react";
import { defaultServerConditions, defaultServerMainFields, defineConfig } from "vite";
import { hostModules } from "./build/vite-plugin-host-modules.mjs";
import { standardDecorators } from "./build/vite-plugin-standard-decorators.mjs";

const entryPoints = {
  renderer: {
    entry: "src/renderer/index.tsx",
    emptyOutDir: true,
    external: [],
    platform: /** @type {const} */ ("browser"),
  },
  main: {
    entry: "src/main/index.ts",
    emptyOutDir: false,
    external: ["electron", /^electron\//, /^node:/, ...builtinModules],
    platform: /** @type {const} */ ("node"),
  },
};

/**
 * Fails the renderer build on an import of Node or Electron: renderer code gets neither in Freelens v2.
 *
 * @type {import("vite").Plugin}
 */
const noNodeInRenderer = {
  name: "no-node-in-renderer",
  enforce: "pre",
  resolveId(source, importer) {
    if (isBuiltin(source) || source === "electron" || source.startsWith("electron/")) {
      this.error(`"${source}" is imported by ${importer}, but renderer code gets no Node or Electron`);
    }
    return null;
  },
};

export default defineConfig(({ mode }) => {
  const name = mode === "main" ? "main" : "renderer";
  const entryPoint = entryPoints[name];

  return {
    plugins: [standardDecorators(), hostModules(name), react(), ...(name === "renderer" ? [noNodeInRenderer] : [])],
    ...(name === "renderer"
      ? { define: { "process.env.NODE_ENV": JSON.stringify("production") } }
      : {
          resolve: { conditions: [...defaultServerConditions], mainFields: [...defaultServerMainFields] },
          define: { __dirname: "import.meta.dirname", __filename: "import.meta.filename" },
        }),
    build: {
      target: "esnext",
      minify: false,
      sourcemap: true,
      emptyOutDir: entryPoint.emptyOutDir,
      lib: {
        entry: entryPoint.entry,
        formats: ["es"],
        fileName: () => `${name}.js`,
        // The host links `renderer.css` next to the renderer entry.
        cssFileName: name,
      },
      rolldownOptions: {
        external: entryPoint.external,
        platform: entryPoint.platform,
      },
    },
  };
});
