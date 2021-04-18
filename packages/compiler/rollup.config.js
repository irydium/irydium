import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";
import { spawn } from "child_process";

import pkg from "./package.json";

export default [
  {
    // libraries for use by other things
    plugins: [
      string({
        include: [
          "src/templates/tasks.js",
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
      "front-matter",
      "svelte/compiler",
      "rollup",
      "cross-fetch",
      "cross-fetch/polyfill",
      "js-yaml",
      "mustache",
      "mdsvex",
      "unist-util-visit",
      "vfile-message",
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
          "src/templates/tasks.js",
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
      "front-matter",
      "svelte/compiler",
      "rollup",
      "cross-fetch",
      "cross-fetch/polyfill",
      "js-yaml",
      "mustache",
      "mdsvex",
      "fs",
      "fsevents",
      "crypto",
      "unist-util-visit",
      "vfile-message",
    ],
    output: [
      { file: "dist/cli.js", format: "cjs", interop: false, sourcemap: false },
    ],
  },
];
