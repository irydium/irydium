import { compile as svelteCompile } from "svelte/compiler";
import mustache from "mustache";

import * as rollup from "rollup/dist/es/rollup.browser.js";
import fetch from "cross-fetch";

import {
  admonitionSource,
  cellResultsSource,
  panelsSource,
  bundleIndexSource,
  taskRunnerSource,
} from "./templates";

const CDN_URL = "https://cdn.jsdelivr.net/npm";

async function fetch_package(url) {
  return (await fetch(url)).text();
}

async function createSvelteBundle(files) {
  const bundle = await rollup.rollup({
    input: "./mdsvelte.svelte",
    plugins: [
      {
        name: "repl-plugin",
        resolveId: async (importee, importer) => {
          // handle imports from 'svelte'

          // import x from 'svelte'
          if (importee === "svelte") return `${CDN_URL}/svelte/index.mjs`;

          // FIXME: horrible hack to allow us to import Y.js
          if (importee.startsWith("lib0/")) {
            return `${CDN_URL}/${importee}.js`;
          }

          // import x from 'svelte/somewhere'
          if (importee.startsWith("svelte/")) {
            return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
          }

          // import x from './file.js' (via a 'svelte' or 'svelte/x' package)
          if (importer && importer.startsWith(`${CDN_URL}/svelte`)) {
            const resolved = new URL(importee, importer).href;
            if (resolved.endsWith(".mjs")) return resolved;
            return `${resolved}/index.mjs`;
          }

          // local repl components
          if (files.has(importee)) return importee;

          // relative imports from a remote package
          if (importee.startsWith(".")) return new URL(importee, importer).href;

          // bare named module imports (importing an npm package)

          // get the package.json and load it into memory
          const pkg_url = `${CDN_URL}/${importee}/package.json`;
          try {
            const pkg = JSON.parse(await fetch_package(pkg_url));
            // get an entry point from the pkg.json - first try svelte, then modules, then main
            if (pkg.svelte || pkg.module || pkg.main) {
              // use the above url minus `/package.json` to resolve the URL
              const url = pkg_url.replace(/\/package\.json$/, "");
              return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`)
                .href;
            }
          } catch (e) {
            // ignore: not great but we can't really do anything about it
          }

          // we probably missed stuff, pass it along as is
          return importee;
        },
        load: async (id) => {
          // local repl components are stored in memory
          // this is our virtual filesystem
          if (files.has(id)) return files.get(id).code;

          // everything else comes from a cdn
          return await fetch_package(id);
        },
        transform: async (code, id) => {
          // our only transform is to compile svelte components
          //@ts-ignore
          if (/.*\.svelte/.test(id)) {
            const compiled = svelteCompile(code);
            if (compiled.warnings.length) {
              throw new Error(
                `Error processing svelte component ${id}:\n` +
                  compiled.warnings.map((w) => w.message).join("\n")
              );
            }
            return compiled.js.code;
          }
        },
      },
    ],
  });

  return (await bundle.generate({ format: "esm" })).output[0].code;
}

export async function svelteToHTML(
  mdSvelte,
  svelteComponents,
  frontMatter,
  options
) {
  const files = new Map([
    ["./mdsvelte.svelte", mdSvelte],
    ["./Admonition.svelte", { code: admonitionSource, map: "" }],
    ["./Panels.svelte", { code: panelsSource, map: ""}],
    ["./CellResults.svelte", { code: cellResultsSource, map: "" }],
    [
      "./taskrunner",
      {
        code: taskRunnerSource,
        map: "",
      },
    ],
    ...svelteComponents,
  ]);
  const svelteJs = await createSvelteBundle(files);
  return {
    html: mustache.render(bundleIndexSource, {
      ...options,
      svelteJs,
    }),
    frontMatter: frontMatter,
  };
}
