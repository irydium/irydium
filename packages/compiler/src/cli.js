import { mdToSvx } from "./mdToSvx";
import { svxToHTML } from "./svxToHTML";

const fs = require("fs");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <md file>`);
  process.exit(1);
}

const input = fs.readFileSync(args[0]);
mdToSvx(input)
  .then((svx) => svxToHTML(svx))
  .then((output) => console.log(output.html))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
