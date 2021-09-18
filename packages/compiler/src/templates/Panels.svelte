<script>
  import { onMount } from "svelte";
  const contents = "Test\n---\nTest2";
  export let panelContents;
  let cards = [];
  let reactiveCards = [];
  let value;

  $: ({ value } = panelContents);

  console.log(value);

  onMount(() => {
    if (contents !== "") {
      cards = parsePanels(contents);
    }
  })

  function parsePanels (contents) {
    const panelDelimiterRegex = /\n\-{3,}\n/;
    const cards = contents.split(panelDelimiterRegex);
    return cards;
  }

</script>

<style>

</style>

<div class="container">
  <div class="row">
    <div></div>
    {#each cards as card, i}
      <ul>
        <li>{card}</li>
      </ul>
    {/each}
  </div>
</div>
