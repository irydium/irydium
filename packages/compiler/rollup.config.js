import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import sucrase from "@rollup/plugin-sucrase";

import { createTemplates } from "./src/create-templates";
import pkg from "./package.json";

const EXTERNALS = [
  "acorn",
  "cross-fetch",
  "cross-fetch/polyfill",
  "front-matter",
  "js-yaml",
  "mustache",
  "rollup",
  "svelte/compiler",
  // FIXME: Uncomment below when we stop compiling to CJS
  // https://github.com/irydium/irydium/issues/244
  //"estree-walker",
  //"micromark",
  //"remark-parse",
  //"unified",
  //"unist-util-visit",
];

const TEMPLATE_PLUGIN = replace({
  "__TEMPLATES = {}":
    "__TEMPLATES = " + JSON.stringify(createTemplates("./src")),
  delimiters: ["", ""],
  preventAssignment: true,
});

export default [
  {
    // libraries for use by other things
    plugins: [
      TEMPLATE_PLUGIN,
      resolve({ browser: true }),
      // unified has an implicit dependency on @rollup/plugin-json
      json(),
      commonjs(),
      sucrase({ transforms: ["typescript"] }),
    ],
    input: "src/main.ts",
    external: EXTERNALS,
    output: [
      { file: pkg.module, format: "es", sourcemap: true },
      { file: pkg.main, format: "cjs", sourcemap: true },
    ],
  },
  {
    // the irydium cli
    plugins: [
      TEMPLATE_PLUGIN,
      resolve({ preferBuiltins: true }),
      // unified has an implicit dependency on @rollup/plugin-json
      json(),
      commonjs(),
      sucrase({ transforms: ["typescript"] }),
    ],
    input: "src/cli.ts",
    external: EXTERNALS,
    output: [
      { file: "dist/cli.js", format: "cjs", interop: false, sourcemap: true },
    ],
  },
];
