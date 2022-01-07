import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import { createTemplates } from "./src/create-templates";
import pkg from "./package.json";

const EXTERNALS = [
  "front-matter",
  "svelte/compiler",
  "rollup",
  "cross-fetch",
  "cross-fetch/polyfill",
  "js-yaml",
  "lodash",
  "mustache",
];

const TEMPLATE_PLUGIN = replace({
  "__TEMPLATES = {}":
    "__TEMPLATES = " + JSON.stringify(createTemplates("./src")),
  delimiters: ["", ""],
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
      typescript(),
    ],
    input: "src/main.ts",
    external: EXTERNALS,
    output: [
      { file: pkg.module, format: "es", sourcemap: false },
      { file: pkg.main, format: "cjs", sourcemap: false },
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
      typescript(),
    ],
    input: "src/cli.ts",
    external: EXTERNALS,
    output: [
      { file: "dist/cli.js", format: "cjs", interop: false, sourcemap: false },
    ],
  },
];
