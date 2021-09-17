// this logic exists to let us use the templates from both
// jest tests (which don't use rollup, but do have the node.js apis)
// and our browser bundle (which doesn't have node.js apis, but does
// have rollup)

let __TEMPLATES = {};

if (!Object.keys(__TEMPLATES).length) {
  const templatePlugin = require("../compiler-plugins.js");
  __TEMPLATES = templatePlugin.createTemplates();
}

const admonitionSource = __TEMPLATES["Admonition.svelte"];
const cellResultsSource = __TEMPLATES["CellResults.svelte"];
const panelsSource = __TEMPLATES["Panels.svelte"];
const bundleIndexSource = __TEMPLATES["index.html"];
const taskScriptSource = __TEMPLATES["tasks.js"];
const taskRunnerSource = __TEMPLATES["taskrunner.js"];
const pythonPluginSource = __TEMPLATES["python.md"];

export {
  admonitionSource,
  cellResultsSource,
  panelsSource,
  bundleIndexSource,
  taskScriptSource,
  taskRunnerSource,
  pythonPluginSource,
};
