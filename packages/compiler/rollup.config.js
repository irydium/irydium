import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import { getBaseCompilerPlugins } from "./compiler-plugins";
import pkg from "./package.json";

export default [
  {
    // libraries for use by other things
    plugins: [
      ...getBaseCompilerPlugins(),
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
    plugins: [...getBaseCompilerPlugins(), resolve({ preferBuiltins: true })],
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
    output: [{ file: "dist/cli.js", format: "cjs", sourcemap: false }],
  },
];
