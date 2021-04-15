import { compile } from "./compile";

const fs = require("fs");

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error(`Usage: ${process.argv[1]} <md file>`);
  process.exit(1);
}
const input = fs.readFileSync(args[0]);
compile(input)
  .then((output) => console.log(output))
  .catch((err) => {
    console.log(err);
    console.log("LOL");
    process.exit(0);
  });
