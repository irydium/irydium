<script>
  import { getContext } from "svelte";
  import GraphView from "./GraphView.svelte";
  const { open } = getContext("simple-modal");

  const openGraph = () => {
    open(GraphView);
  };
</script>

<style>
  iframe {
    border: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .header {
    z-index: 1000;
  }

  .buttons {
    z-index: 1000;
    position: fixed;
    right: 20px;
    top: 10px;
  }
</style>

<div class="header">
  <div class="buttons">
    <button on:click={openGraph}>Graph</button>
    <button>Debug</button>
  </div>
</div>
<iframe title="irydium" src="/iridium" />
