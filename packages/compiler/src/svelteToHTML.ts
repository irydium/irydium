import { compile as svelteCompile } from "svelte/compiler";
import mustache from "mustache";

import * as rollup from "rollup/dist/es/rollup.browser.js";
import fetch from "cross-fetch";

import {
  admonitionSource,
  panelsSource,
  cardSource,
  cellResultsSource,
  glueSource,
  bundleIndexSource,
  taskRunnerSource,
} from "./templates";
import type {
  CompileOptions,
  CompilerOutput,
  FrontMatter,
  SvelteComponentDefinition,
  SvelteComponentVFile,
} from "./types";

// heavily inspired by the svelte repl bundler: https://github.com/sveltejs/sites/blob/69937f8e13f59c35576500f844b80c26d6f3f459/packages/repl/src/lib/workers/bundler/index.js
// as well as https://github.com/pngwn/REPLicant

const CDN_URL = "https://unpkg.com";
const svelteUrl = `${CDN_URL}/svelte`;
const packagesUrl = CDN_URL;

const fetch_cache = new Map();
async function fetch_if_uncached(url: string) {
	if (fetch_cache.has(url)) {
		return fetch_cache.get(url);
	}

	const promise = fetch(url)
		.then(async (r) => {
			if (r.ok) {
				return {
					url: r.url,
					body: await r.text()
				};
			}

			throw new Error(await r.text());
		})
		.catch((err) => {
			fetch_cache.delete(url);
			throw err;
		});

	fetch_cache.set(url, promise);
	return promise;
}

async function follow_redirects(url: string) {
	const res = await fetch_if_uncached(url);
	return res.url;
}

async function createSvelteBundle(
  files: Map<string, SvelteComponentDefinition>
): Promise<string> {
  const bundle = await rollup.rollup({
    input: "./mdsvelte.svelte",
    plugins: [
      {
        name: "repl-plugin",
        resolveId: async (importee: string, importer: string) => {
          // importing from Svelte
          if (importee === `svelte`) return `${svelteUrl}/index.mjs`;
          if (importee.startsWith(`svelte/`)) {
            return `${svelteUrl}/${importee.slice(7)}/index.mjs`;
          }

          // importing one Svelte runtime module from another
          if (importer && importer.startsWith(svelteUrl)) {
            const resolved = new URL(importee, importer).href;
            if (resolved.endsWith('.mjs')) return resolved;
            return `${resolved}/index.mjs`;
          }

          // importing from another file in REPL
          if (files.has(importee) && (!importer || files.has(importer))) return importee;
          if (files.has(importee + '.js')) return importee + '.js';
          if (files.has(importee + '.json')) return importee + '.json';

          // remove trailing slash
          if (importee.endsWith('/')) importee = importee.slice(0, -1);

          // importing from a URL
          if (importee.startsWith('http:') || importee.startsWith('https:')) return importee;

          // importing from (probably) unpkg
          if (importee.startsWith('.')) {
            const url = new URL(importee, importer).href;

            return await follow_redirects(url);
          } else {
            // fetch from cdn
            try {
              const pkg_url = await follow_redirects(`${packagesUrl}/${importee}/package.json`);
              const pkg_json = (await fetch_if_uncached(pkg_url)).body;
              const pkg = JSON.parse(pkg_json);

              if (pkg.svelte || pkg.module || pkg.main) {
                const url = pkg_url.replace(/\/package\.json$/, '');
                return new URL(pkg.svelte || pkg.module || pkg.main, `${url}/`).href;
              }
            } catch (err) {
              // ignore
            }

            return await follow_redirects(`${packagesUrl}/${importee}`);
          }
        },
        load: async (id: string): Promise<string> => {
          // local repl components are stored in memory
          // this is our virtual filesystem
          if (files.has(id)) {
            const file = files.get(id);
            return (file && file.code) || "";
          }
          // everything else comes from a cdn
          const res = await fetch_if_uncached(id);
          return res.body;
        },
        transform: async (code: string, id: string): Promise<string> => {
          // our only transform is to compile svelte components
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
          return code;
        },
      },
    ],
  });

  return (await bundle.generate({ format: "esm" })).output[0].code;
}

export async function svelteToHTML(
  mdSvelte: SvelteComponentDefinition,
  svelteComponents: Array<SvelteComponentVFile>,
  frontMatter: FrontMatter,
  options: CompileOptions
): Promise<CompilerOutput> {
  const files = new Map([
    ["./mdsvelte.svelte", mdSvelte],
    ["./Admonition.svelte", { code: admonitionSource, map: "" }],
    ["./Panels.svelte", { code: panelsSource, map: "" }],
    ["./Card.svelte", { code: cardSource, map: "" }],
    ["./Glue.svelte", { code: glueSource, map: "" }],
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
