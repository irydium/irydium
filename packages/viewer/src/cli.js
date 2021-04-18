import { compile } from "../../compiler/src/compile.js";

// the following two files are imported as strings, this lets us
// return them literally
import bundlecss from "../build/bundle.css";
import bundlejs from "../build/bundle.js";
import index from "./index.html";

const livereload = require("livereload");
const mustache = require("mustache");
const polka = require("polka");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <irmd file>`);
  process.exit(1);
}

const irmdReloadServer = livereload.createServer({ extraExts: ["md"] });
irmdReloadServer.watch([path.dirname(args[0])]);

// only add logic to reload the dev server for non-production cases
const BUILD_DIR = __dirname + "/../build";
const BUILD_LIVERELOAD_PORT = 35730;
let buildReloadServer;
if (!__PRODUCTION__) {
  buildReloadServer = livereload.createServer({
    port: BUILD_LIVERELOAD_PORT,
  });

  //
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
  .get("/iridium", async (_, res) => {
    const input = getFileContents(args[0]);
    try {
      const output = await compile(input, { liveReload: true });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(output);
    } catch (err) {
      console.log(err);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`${err.type} on line ${err.lineNumber}: ${err.message}`);
    }
  })
  .listen(3000, (err) => {
    if (err) throw err;
    console.log(`> Running on localhost:3000`);
  });
