<!-- this is the root component in the generated svelte application -->
<script>
  export let tasks = [];

  import { runTasks } from "./taskrunner";
  import MdSvelte from "./mdsvelte.svelte";

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

  notifyUpdateTasks(tasks);

  let taskPromise = runTasks(tasks).then((tasks) => {
    // crude hack: turn the tasks into global state
    let outputs = {};
    tasks.forEach((task) => {
      window[task.id] = outputs[task.id] = task.value;
    });
    return outputs;
  });
</script>

<article class="prose container max-w-screen-lg py-8 mx-auto">
  {#await taskPromise then outputs}
    <MdSvelte {...outputs} />
  {/await}
</article>
