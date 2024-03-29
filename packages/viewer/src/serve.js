/* global __PRODUCTION__ */
import { compile } from "@irydium/compiler";

// the following two files are imported as strings, this lets us
// return them literally
import bundlecss from "../build/bundle.css";
import bundlejs from "../build/bundle.js";
import index from "./index.html";

import serve from "sirv";

const livereload = require("livereload");
const ws = require("ws");
const chokidar = require("chokidar");
const mustache = require("mustache");
const polka = require("polka");
const fs = require("fs");

function getFileContents(filename) {
  return fs.readFileSync(filename);
}

export default function serveDocument(filename, staticDir) {
  // we can't use livereload for the document itself, because it might not be rendered as HTML
  // FIXME: assuming we can create a server on port 35731 is probably wrong
  const mdReloadServer = new ws.Server({ port: 35731 });
  chokidar.watch(filename).on("change", () => {
    mdReloadServer.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        client.send("1");
      }
    });
  });

  // only add logic to reload the dev server for non-production cases
  const BUILD_DIR = __dirname + "/../build";
  const BUILD_LIVERELOAD_PORT = 35730;
  let buildReloadServer;
  if (!__PRODUCTION__) {
    buildReloadServer = livereload.createServer({
      port: BUILD_LIVERELOAD_PORT,
    });

    buildReloadServer.server.once("connection", () => {
      setTimeout(() => {
        buildReloadServer.refresh("/");
      }, 100);
    });
  }

  polka()
    .use(serve(staticDir))
    .get("/", async (_, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        mustache.render(index, {
          liveReload: !__PRODUCTION__,
          liveReloadPort: BUILD_LIVERELOAD_PORT,
        })
      );
    })
    .get("/bundle.css", async (_, res) => {
      if (__PRODUCTION__) {
        res.end(bundlecss);
      } else {
        res.end(getFileContents(`${BUILD_DIR}/bundle.css`));
      }
    })
    .get("/bundle.js", async (_, res) => {
      if (__PRODUCTION__) {
        res.end(bundlejs);
      } else {
        res.end(getFileContents(`${BUILD_DIR}/bundle.js`));
      }
    })
    .get("/iridium", async (req, res) => {
      const input = getFileContents(filename).toString();
      try {
        const output = await compile(input, {
          ...req.query,
          server: "http://localhost:3000",
        });
        res.writeHead(200, {
          "Content-Type": `${
            req.query.mode !== "html" ? "text/plain" : "text/html"
          }; charset=utf-8`,
        });
        res.end(output.html);
      } catch (err) {
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(err.stack);
      }
    })
    .listen(3000, (err) => {
      if (err) throw err;
      console.log(`> Running on http://localhost:3000`);
    });
}
