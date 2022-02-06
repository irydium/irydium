import { Command } from "commander";
import serve from "./serve";
const fs = require("fs");

const program = new Command();
program
  .argument("<md file>", "file to view")
  .option(
    "-s, --static <directory>",
    "directory to serve static files from",
    "."
  )
  .action(function () {
    const mdFile = this.args[0];
    // check that file actually exists
    if (!fs.existsSync(mdFile)) {
      console.error(`${mdFile} does not exist`);
      process.exit(1);
    }
    serve(this.args[0], this.opts().static);
  });

program.showHelpAfterError().parse();
