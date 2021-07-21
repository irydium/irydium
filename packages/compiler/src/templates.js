// this logic exists to let us use the templates from both
// jest tests (which don't use rollup, but do have the node.js apis)
// and our browser bundle (which doesn't have node.js apis, but does
// have rollup)

let __TEMPLATES = {};

if (!Object.keys(__TEMPLATES).length) {
  const templatePlugin = require("../compiler-plugins.js");
  __TEMPLATES = templatePlugin.createTemplates();
}

const admonitionSource = __TEMPLATES["templates/Admonition.svelte"];
const bundleIndexSource = __TEMPLATES["templates/index.html"];
const taskScriptSource = __TEMPLATES["templates/tasks.js"];
const taskRunnerSource = __TEMPLATES["taskrunner.js"];

export {
  admonitionSource,
  bundleIndexSource,
  taskScriptSource,
  taskRunnerSource,
};
