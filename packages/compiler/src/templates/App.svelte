<!-- this is the root component in the generatd svelte application -->
<script>
  export let tasks = [];

  import { runTasks } from "./taskrunner";
  import MdSvelte from "./mdsvelte.svelte";

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
