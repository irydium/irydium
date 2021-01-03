import mustache from "mustache";
import { compile as svelteCompile } from "svelte/compiler";
import { compile as mdsvexCompile } from "mdsvex";
import { parseChunks } from "./parser.js";

// just requiring rollup and cross-fetch directly for now (this
// means this code won't run in a browser environment, which is
// fine since mdsvex doesn't support that either)
//import * as rollup from "rollup/dist/es/rollup.browser.js";
const rollup = require("rollup");
const fetch = require("cross-fetch");

import template from "./template.html";

const CDN_URL = "https://cdn.jsdelivr.net/npm";

async function fetch_package(url) {
  return (await fetch(url)).text();
}

async function createSvelteBundle(svelteFiles) {
  const bundle = await rollup.rollup({
    input: "./index.svelte",
    plugins: [
      {
        name: "repl-plugin",
        resolveId: async (importee, importer) => {
          // handle imports from 'svelte'

          // import x from 'svelte'
          if (importee === "svelte") return `${CDN_URL}/svelte/index.mjs`;

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
          if (svelteFiles.has(importee)) return importee;

          // relative imports from a remote package
          if (importee.startsWith(".")) return new URL(importee, importer).href;

          // bare named module imports (importing an npm package)

          // get the package.json and load it into memory
          const pkg_url = `${CDN_URL}/${importee}/package.json`;
          const pkg = JSON.parse(await fetch_package(pkg_url));

          // get an entry point from the pkg.json - first try svelte, then modules, then main
          if (pkg.svelte || pkg.module || pkg.main) {
            // use the aobove url minus `/package.json` to resolve the URL
            const url = pkg_url.replace(/\/package\.json$/, "");
            return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`)
              .href;
          }

          // we probably missed stuff, pass it along as is
          return importee;
        },
        load: async (id) => {
          // local repl components are stored in memory
          // this is our virtual filesystem
          if (svelteFiles.has(id)) return svelteFiles.get(id).code;

          // everything else comes from a cdn
          return await fetch_package(id);
        },
        transform: async (code, id) => {
          // our only transform is to compile svelte components
          //@ts-ignore
          if (/.*\.svelte/.test(id)) return svelteCompile(code).js.code;
        },
      },
    ],
  });

  return (await bundle.generate({ format: "esm" })).output[0].code;
}

export async function compile(input) {
  const chunks = parseChunks(input);

  const jsChunks = chunks
    .filter((chunk) => chunk.type === "js")
    .map((chunk) => ({ ...chunk, code: chunk.content }));

  // python chunks are actually just js chunks
  const pyChunks = chunks
    .filter((chunk) => chunk.type === "py")
    .map((chunk) => {
      const preamble = chunk.frontMatter.inputs.length
        ? `from js import ${chunk.frontMatter.inputs.join(",")}\\n`
        : "";
      return {
        ...chunk,
        code: `return (await pyodide.runPythonAsync(\"${preamble}${chunk.lines.join(
          "\\n"
        )}\"))`,
      };
    });

  // we convert all markdown chunks into one big document which we
  // compile with mdsvex
  // FIXME: this may not play nice with script directives, need to figure
  // out how to handle this
  const svelteFiles = new Map();
  const mdSvelte = await mdsvexCompile(
    chunks
      .filter((chunk) => chunk.type === "md")
      .map((chunk) => chunk.content)
      .join("\n"),
    {}
  );
  svelteFiles.set("./index.svelte", mdSvelte);

  // any remaining svelte cells are components we can import
  chunks
    .filter((chunk) => chunk.type === "svelte")
    .forEach((chunk) => {
      // FIXME: need to verify that a filename is provided for these cells
      svelteFiles.set(`./${chunk.frontMatter.filename}`, {
        code: chunk.content,
        map: "",
      });
    });
  const svelteJs = await createSvelteBundle(svelteFiles);
  return mustache.render(template, {
    ...chunks[0].frontMatter,
    hasPyChunks: pyChunks.length > 0,
    jsChunks: pyChunks.concat(jsChunks),
    svelteJs,
  });
}
