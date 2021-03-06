import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";

import pkg from "./package.json";

export default [
  {
    // libraries for use by other things
    plugins: [
      string({
        include: [
          "src/templates/App.svelte",
          "src/templates/index.html",
          "../taskrunner/src/main.js",
        ],
      }),
      resolve({ browser: true }),
      commonjs(),
    ],
    input: "src/main.js",
    external: [
      "svelte/compiler",
      "rollup",
      "cross-fetch",
      "cross-fetch/polyfill",
      "mustache",
      "mdsvex",
      "toml",
    ],
    output: [
      { file: pkg.module, format: "es", sourcemap: false },
      { file: pkg.main, format: "cjs", sourcemap: false },
    ],
  },
  {
    // the irydium cli
    plugins: [
      string({
        include: [
          "src/templates/App.svelte",
          "src/templates/index.html",
          "../taskrunner/src/main.js",
        ],
      }),
      resolve({ preferBuiltins: true }),
      commonjs(),
    ],
    input: "src/cli.js",
    external: [
      "svelte/compiler",
      "rollup",
      "cross-fetch",
      "cross-fetch/polyfill",
      "mustache",
      "mdsvex",
      "toml",
      "fs",
      "fsevents",
      "crypto",
    ],
    output: [
      { file: "dist/cli.js", format: "cjs", interop: false, sourcemap: false },
    ],
  },
];
