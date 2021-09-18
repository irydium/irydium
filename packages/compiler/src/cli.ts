import { compile } from "./compile";

import * as fs from "fs";

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <md file>`);
  process.exit(1);
}

const input = fs.readFileSync(args[0]).toString();
compile(input)
  .then((output) => console.log(output.html))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
