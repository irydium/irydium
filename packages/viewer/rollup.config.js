import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { string } from "rollup-plugin-string";
import { spawn } from "child_process";

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
        server.kill();
        setTimeout(startServer, 250);
      } else {
        startServer();
      }

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default [
  {
    // the irydium cli
    plugins: [
      string({
        include: ["../compiler/**/*.html"],
      }),
      resolve({ preferBuiltins: true }),
      commonjs(),
      serve(),
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
