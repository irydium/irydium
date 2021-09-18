import css from "rollup-plugin-css-only";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { string } from "rollup-plugin-string";
import { spawn } from "child_process";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  async function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      function startServer() {
        server = spawn(
          "npm",
          ["run", "start", "--", `../../${process.argv.slice(4)}`],
          {
            stdio: ["ignore", "inherit", "inherit"],
            shell: true,
          }
        );
      }

      // if server has already started, kill it and wait a short while
      if (server) {
        server.on("exit", startServer);
        server.kill();
      } else {
        startServer();
      }

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default [
  // viewer components
  {
    input: "src/app.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "app",
      file: "build/bundle.js",
    },
    plugins: [
      svelte(),
      css({ output: "bundle.css" }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
    ],
  },
  // the irydium cli
  {
    plugins: [
      string({
        include: ["build/bundle.*", "./src/index.html"],
      }),
      replace({
        __PRODUCTION__: production,
      }),
      svelte(),
      resolve({ preferBuiltins: true }),
      commonjs(),
      !production && serve(),
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
