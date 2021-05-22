<script>
  import { getContext } from "svelte";
  import GraphView from "./GraphView.svelte";
  const { open } = getContext("simple-modal");

  let rawMode;

  let iframe;

  let mdChangeSocket = new WebSocket("ws://localhost:35731");
  mdChangeSocket.onmessage = function (event) {
    iframe.contentWindow.location.reload();
  };

  const openGraph = () => {
    open(GraphView);
  };

  const toggleRaw = () => {
    rawMode = !rawMode;
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
    <button on:click={toggleRaw}>{rawMode ? 'Normal' : 'Raw'}</button>
  </div>
</div>
<iframe
  bind:this={iframe}
  title="irydium"
  src={`/iridium${rawMode ? '?raw=1' : ''}`} />
