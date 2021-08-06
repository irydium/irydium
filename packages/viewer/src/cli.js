import { compile } from "../../compiler/src/compile.js";

// the following two files are imported as strings, this lets us
// return them literally
import bundlecss from "../build/bundle.css";
import bundlejs from "../build/bundle.js";
import index from "./index.html";

const livereload = require("livereload");
const ws = require("ws");
const chokidar = require("chokidar");
const mustache = require("mustache");
const polka = require("polka");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <md file>`);
  process.exit(1);
}

const filename = args[0];

// check that file actually exists
if (!fs.existsSync(filename)) {
  console.error(`${filename} does not exist`);
  process.exit(1);
}

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

function getFileContents(filename) {
  return fs.readFileSync(filename);
}

polka()
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
      const output = await compile(input, req.query);
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
    console.log(`> Running on localhost:3000`);
  });
