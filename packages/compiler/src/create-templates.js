export function createTemplates(baseDir) {
  const fs = require("fs");
  const path = require("path");

  const dirname = baseDir || __dirname;

  return [
    "../../site/static/components/python.md",
    "templates/Admonition.svelte",
    "templates/Panels.svelte",
    "templates/Card.svelte",
    "templates/CellResults.svelte",
    "templates/Glue.svelte",
    "templates/index.html",
    "templates/tasks.js",
    "taskrunner.js",
  ].reduce((acc, filename) => {
    return {
      ...acc,
      [path.basename(filename)]: fs.readFileSync(
        `${dirname}/${filename}`,
        "utf8"
      ),
    };
  }, {});
}
