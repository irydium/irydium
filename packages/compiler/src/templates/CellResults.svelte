<script>
  import { onMount } from "svelte";

  export let value;
  let container;
  onMount(() => {
    let domNode;
    if (value instanceof Element) {
      domNode = value;
    } else {
      domNode = document.createElement("div");
      domNode.innerHTML = JSON.stringify(value);
    }
    container.appendChild(domNode);
  });
</script>

<div bind:this={container} />
