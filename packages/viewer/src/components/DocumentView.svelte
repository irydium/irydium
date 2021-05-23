<script>
  import { getContext } from "svelte";
  import GraphView from "./GraphView.svelte";
  const { open } = getContext("simple-modal");

  let mode = "html";

  let iframe;

  let mdChangeSocket = new WebSocket("ws://localhost:35731");
  mdChangeSocket.onmessage = function (event) {
    iframe.contentWindow.location.reload();
  };

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
    <select bind:value={mode}>
      <option value="html">Rendered</option>
      <option value="rawhtml">Raw HTML</option>
      <option value="mdsvex">mdsvex output</option>
    </select>
  </div>
</div>
<iframe bind:this={iframe} title="irydium" src={`/iridium?mode=${mode}`} />
