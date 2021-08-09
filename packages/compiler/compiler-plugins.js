import replace from "@rollup/plugin-replace";
import json from "rollup-plugin-json";
import { string } from "rollup-plugin-string";

export function createTemplates(baseDir) {
  const dirname = baseDir || __dirname;

  const fs = require("fs");
  const path = require("path");

  return [
    "../../site/static/components/python.md",
    "templates/Admonition.svelte",
    "templates/CellResults.svelte",
    "templates/index.html",
    "templates/tasks.js",
    "taskrunner.js",
  ].reduce((acc, filename) => {
    return {
      ...acc,
      [path.basename(filename)]: fs.readFileSync(
        `${dirname}/src/${filename}`,
        "utf8"
      ),
    };
  }, {});
}

export const getBaseCompilerPlugins = (baseDir = ".") => {
  return [
    // unified has an implicit dependency on rollup-plugin-json
    json(),
    string({
      include: ["../site/**/*.md"],
    }),
    replace({
      "__TEMPLATES = {}":
        "__TEMPLATES = " + JSON.stringify(createTemplates(baseDir)),
      delimiters: ["", ""],
    }),
  ];
};
