// This should get inserted into an irydium document's top-level component's script chunk at compile time
import { TASK_STATE, runTasks, updateTask } from "./taskrunner";

{{#frontMatter}}
let {{{key}}} = {{{value}}};
{{/frontMatter}}

{{#taskVariables}}
let {{.}};
{{/taskVariables}}

const __tasks = [
  {{#tasks}}
  {
    id: "{{{id}}}",
    type: {{type}},
    payload: {{{payload}}},
    state: {{state}},
    {{#hash}}
    hash: {{{hash}}},
    {{/hash}}
    inputs: {{{inputs}}}
  },
  {{/tasks}}
];

function notifyUpdateTasks(tasks) {
  // send task state to parent
  window.parent.postMessage({
    tasks: __tasks.map((t) => ({
      id: t.id,
      type: t.type,
      state: t.state,
      inputs: t.inputs,
    })),
  });
}

notifyUpdateTasks(__tasks);
let settled = false;

function runDag() {
  return runTasks(__tasks).then(() => {
    let outputs = {};
    __tasks.forEach((task) => {
      outputs[task.id] = task.value;
    });
    {{#taskVariables}}
    {{.}} = outputs['{{.}}'];
    {{/taskVariables}}
    settled = true;
  });
}

let __taskPromise = runDag();

$: {
  let needsRefresh = false;
  if (settled) {
    // synchronize the taskgraph with any variables
    const __taskMap = __tasks.reduce((acc, cur) => Object.assign(acc, {[cur.id]: cur}), {});
    {{#taskVariables}}
    if (__taskMap['{{.}}'].state === TASK_STATE.COMPLETE && __taskMap['{{.}}'].value !== {{.}}) {
      // need to refresh the task graph
      updateTask(__tasks, '{{.}}', {{.}});
      needsRefresh = true;
    }
    {{/taskVariables}}

    // re-run dag
    if (needsRefresh) {
      runDag();
    }
  }

}
