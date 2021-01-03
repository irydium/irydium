import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import html from "rollup-plugin-html";

import pkg from "./package.json";

export default [
  {
    // libraries for use by other things
    plugins: [
      html({
        include: "**/*.html",
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
    // the iridium cli
    plugins: [
      html({
        include: "**/*.html",
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
