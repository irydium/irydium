<script>
  import Editor from "../../components/Editor.svelte";
  import Output from "../../components/Output.svelte";
  import intro from "../../examples/repl.md";

  let md = intro;
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

<svelte:head>
  <title>Repl</title>
</svelte:head>

<div class="body">
  <section>
    <Editor bind:md />
  </section>
  <section>
    <Output {md} />
  </section>
</div>
