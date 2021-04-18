// This should get inserted into the mdsvex component's script chunk at compile time
import { runTasks } from "./taskrunner";

{{#taskVariables}}
let {{.}};
{{/taskVariables}}

const __tasks = [
  {{#tasks}}
  {
    type: {{type}},
    payload: {{{payload}}},
    state: {{state}},
    id: "{{{id}}}",
    inputs: {{{inputs}}}
  },
  {{/tasks}}
];

function notifyUpdateTasks(tasks) {
  // send task state to parent
  window.parent.postMessage({
    tasks: __tasks.map((t) => ({
      type: t.type,
      state: t.state,
      id: t.id,
      inputs: t.inputs,
    })),
  });
}

notifyUpdateTasks(__tasks);
let __taskPromise = runTasks(__tasks).then(() => {
  let outputs = {};
  __tasks.forEach((task) => {
    outputs[task.id] = task.value;
  });
  {{#taskVariables}}
  {{.}} = outputs['{{.}}'];
  {{/taskVariables}}
});
