import { compile } from "./compile";

const fs = require("fs");

const args = process.argv.slice(2);
const input = fs.readFileSync(args[0]);
compile(input).then((output) => console.log(output));
