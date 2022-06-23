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

  function killServer() {
    if (server) {
      /* On linux, server.kill() only kills the parent shell (sh) process but not the child sirv instance
		   See https://nodejs.org/docs/latest-v14.x/api/child_process.html#child_process_subprocess_kill_signal
		   Passing the negation of PID of a detached process to 'kill' stops all its children */
      try {
        spawn("kill", ["--", `-${server.pid}`], { shell: true });
      } catch (_) {
        server.kill();
      }
    }
  }

  return {
    writeBundle() {
      function startServer() {
        server = spawn(
          "npm",
          [
            "run",
            "start",
            "--",
            "--static",
            "../site/static",
            `../../${process.argv.slice(4)}`,
          ],
          {
            stdio: ["ignore", "inherit", "inherit"],
            detached: true,
          }
        );
      }
      // if server has already started, kill it and restart
      if (server) {
        server.on("exit", startServer);
        killServer();
      } else {
        startServer();
      }

      process.on("SIGTERM", killServer);
      process.on("exit", killServer);
    },
    /* Rollup restarts on detecting changes to this config file.
		   This hook makes sure the previously started instance is stopped before starting a new one */
    closeWatcher: killServer,
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
        preventAssignment: true,
      }),
      svelte(),
      resolve({ preferBuiltins: true }),
      commonjs(),
      // via: https://stackoverflow.com/a/63548394
      {
        name: "watch-compiler",
        buildStart() {
          this.addWatchFile("../compiler/dist/main.cjs.js");
        },
      },
      !production && serve(),
    ],
    input: "src/cli.js",
    external: [
      "@irydium/compiler",
      "commander",
      "mustache",
      "polka",
      "sirv",
      "svelte/compiler",
    ],
    output: [
      { file: "dist/cli.js", format: "cjs", interop: false, sourcemap: false },
    ],
    watch: {
      clearScreen: false,
      buildDelay: 100,
    },
  },
];
