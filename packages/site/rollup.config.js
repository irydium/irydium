import { config as dotenvConfig } from "dotenv";
import path from "path";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";
import url from "@rollup/plugin-url";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import config from "@wlach/sapper/config/rollup.js";
import pkg from "./package.json";

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

// process our dotenv file, if present
const dotenvFilename = "../../.env";
dotenvConfig({ path: dotenvFilename });

const onwarn = (warning, onwarn) =>
  (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
  (warning.code === "CIRCULAR_DEPENDENCY" &&
    /[/\\]@sapper[/\\]/.test(warning.message)) ||
  warning.code === "THIS_IS_UNDEFINED" ||
  onwarn(warning);

export default {
  client: {
    input: config.client.input().replace(/\.js$/, ".ts"),
    output: config.client.output(),
    plugins: [
      string({
        include: ["./static/**/*.md"],
      }),
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
        "process.env.BASE_URL": JSON.stringify(baseUrl),
        __api: JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        }),
        preventAssignment: true,
      }),
      json(),
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          dev,
          hydratable: true,
        },
      }),
      url({
        sourceDir: path.resolve(__dirname, "src/node_modules/images"),
        publicPath: "/client/",
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({ sourceMap: dev }),

      !dev &&
        terser({
          module: true,
        }),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: { server: config.server.input().server.replace(/\.js$/, ".ts") },
    output: config.server.output(),
    plugins: [
      replace({
        "process.browser": false,
        "process.env.NODE_ENV": JSON.stringify(mode),
        "process.env.BASE_URL": JSON.stringify(baseUrl),
        __api: JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        }),
        preventAssignment: true,
      }),
      string({
        include: ["./static/**/*.md"],
      }),
      json(),
      svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
          dev,
          generate: "ssr",
          hydratable: true,
        },
        emitCss: false,
      }),
      url({
        sourceDir: path.resolve(__dirname, "src/node_modules/images"),
        publicPath: "/client/",
        emitFiles: false, // already emitted by client build
      }),
      resolve({
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules
    ),

    preserveEntrySignatures: "strict",
    onwarn,
  },

  serviceworker: {
    input: config.serviceworker.input().replace(/\.js$/, ".ts"),
    output: config.serviceworker.output(),
    plugins: [
      resolve(),
      replace({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
      !dev && terser(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },
};
