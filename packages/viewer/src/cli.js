import { compile } from "../../compiler/src/compile.js";

const livereload = require("livereload");
const polka = require("polka");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <irmd file>`);
  process.exit(1);
}

const server = livereload.createServer({ extraExts: ["irmd"] });
server.watch(path.dirname(args[0]));

polka()
  .get("/", async (req, res) => {
    const input = fs.readFileSync(args[0]);
    const output = await compile(input, { liveReload: true });

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(output);
  })
  .listen(3000, (err) => {
    if (err) throw err;
    console.log(`> Running on localhost:3000`);
  });
