<script>
  import Editor from "../../components/Editor.svelte";
  import Output from "../../components/Output.svelte";
  import intro from "../../examples/intro.md";

  let md = intro;
  let isBrowser = typeof window !== "undefined";
</script>

<style>
  .body {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 100% auto;
    gap: 0px;
    width: 100%;
    height: 100%;
  }

  section {
    height: calc(100vh - var(--nav-h));
  }
</style>

<div class="body">
  <section>
    {#if isBrowser}
      <Editor bind:md />
    {/if}
  </section>
  <section>
    <Output {md} />
  </section>
</div>
