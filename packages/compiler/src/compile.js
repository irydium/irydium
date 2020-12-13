import { parse as tomlParse } from "toml";
import mustache from "mustache";
import { compile as svelteCompile } from "svelte/compiler";
import { compile as mdsvexCompile } from "mdsvex";
import { rollup } from "rollup";
import template from "./template.html";

// need to use "require" to make this import the right things
// for node.js builds
const fetch = require("cross-fetch");

const CDN_URL = "https://cdn.jsdelivr.net/npm";

async function fetch_package(url) {
  return (await fetch(url)).text();
}

async function createSvelteBundle(svelteFiles) {
  const bundle = await rollup({
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
  const lines = input.toString().split("\n");
  const chunks = [];

  let parsedFrontMatter = false;
  let currentChunk = {
    type: "header",
    lines: [],
    frontMatterLines: [],
  };
  lines
    //      .map((line) => line.trim())
    .forEach((line) => {
      if (line === "---" && !parsedFrontMatter) {
        parsedFrontMatter = true;
        currentChunk.frontMatterLines = currentChunk.lines;
        currentChunk.lines = [];
      } else if (line.startsWith("%%")) {
        chunks.push(currentChunk);
        currentChunk = {
          type: line.substr(2).trim(),
          lines: [],
          frontMatterLines: [],
        };
        parsedFrontMatter = false;
      } else {
        currentChunk.lines.push(line);
      }
    });
  if (currentChunk.lines.length) {
    chunks.push(currentChunk);
  }

  chunks.forEach((chunk) => {
    if (chunk.frontMatterLines.length) {
      chunk.frontMatter = tomlParse(chunk.frontMatterLines.join("\n"));
      // HACK: re-interpret frontmatter "data" in a way that mustache can render
      if (chunk.frontMatter.data) {
        chunk.frontMatter.data = Object.keys(chunk.frontMatter.data).map(
          (k) => ({
            name: k,
            url: chunk.frontMatter.data[k],
          })
        );
      }
    }
  });

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

  const jsChunks = chunks
    .filter((chunk) => chunk.type === "js")
    .map((chunk) => ({ ...chunk, code: chunk.lines.join("\n") }));

  // we convert all markdown chunks into one big document which we
  // compile with mdsvex
  // FIXME: this may not play nice with script directives, need to figure
  // out how to handle this
  const svelteFiles = new Map();
  const mdSvelte = await mdsvexCompile(
    chunks
      .filter((chunk) => chunk.type === "md")
      .map((chunk) => chunk.lines.join("\n"))
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
        code: chunk.lines.join("\n"),
        map: "",
      });
    });
  const svelteJs = await createSvelteBundle(svelteFiles);
  return mustache.render(template, {
    ...chunks[0].frontMatter,
    jsChunks: pyChunks.concat(jsChunks),
    svelteJs,
  });
}
