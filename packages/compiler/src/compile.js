import { compile as svelteCompile } from "svelte/compiler";
import { compile as mdsvexCompile } from "mdsvex";
import mustache from "mustache";
import { codeExtractor, codeInserter, frontMatterExtractor } from "./plugins";

// just requiring rollup and cross-fetch directly for now (this
// means this code won't run in a browser environment, which is
// fine since mdsvex doesn't support that either)
//import * as rollup from "rollup/dist/es/rollup.browser.js";
const rollup = require("rollup");
const fetch = require("cross-fetch");

// note this is loaded as a *string*-- we rely on the compiler to transform it into
// JavaScript at build-time
import index from "./templates/index.html";
import taskRunnerSource from "./templates/taskrunner.js";

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
          if (files.has(id)) return files.get(id).code;

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

export async function compile(input, options = {}) {
  let state = {
    codeNodes: [],
    frontMatter: {},
    svelteCells: [],
  };
  const mdSvelte = await mdsvexCompile(input, {
    remarkPlugins: [codeExtractor(state)],
    rehypePlugins: [codeInserter(state)],
    frontmatter: {
      parse: frontMatterExtractor(state),
      marker: "-",
      type: "yaml",
    },
  });
  const files = new Map([
    ["./mdsvelte.svelte", mdSvelte],
    [
      "./taskrunner",
      {
        code: taskRunnerSource,
        map: "",
      },
    ],
    ...state.svelteCells.map((sc) => [
      `./${sc.name}.svelte`,
      { code: sc.body, map: "" },
    ]),
  ]);
  const svelteJs = await createSvelteBundle(files);

  return mustache.render(index, {
    ...options,
    svelteJs,
  });
}
