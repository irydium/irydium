<script>
  import { onMount } from "svelte";
  const contents = "Test --- Test2";
  let cards = [];

  onMount(() => {
    if (contents !== "") {
      cards = parsePanels(contents);
    }
  })

  function parsePanels (contents) {
    const panelDelimiterRegex = /\-{3,}/;
    const cards = contents.split(panelDelimiterRegex);
    return cards;
  }
</script>

<style>

</style>

<div class="container">
  <div class="row">
    {#each cards as card, i}
      <ul>
        <li>{card}</li>
      </ul>
    {/each}
  </div>
</div>
