import virtual from "@rollup/plugin-virtual";
import { string } from "rollup-plugin-string";

const fs = require("fs");

export const getBaseCompilerPlugins = (baseDir = ".") => [
  virtual({
    [`${baseDir}/src/templates/taskrunner.js`]: `export default ${JSON.stringify(
      fs.readFileSync(`${baseDir}/src/taskrunner.js`, "utf8")
    )}`,
  }),
  string({
    include: [
      `${baseDir}/src/templates/tasks.js`,
      `${baseDir}/src/templates/App.svelte`,
      `${baseDir}/src/templates/index.html`,
    ],
  }),
];
