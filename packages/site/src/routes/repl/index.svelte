<script>
  import Editor from "../../components/Editor.svelte";
  import Output from "../../components/Output.svelte";
  import example from "../../examples/document.irmd";

  let irmd = example;
</script>

<style>
  .body {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 100% auto;
    gap: 10px;
    width: 100%;
    height: 100%;
  }

  section {
    height: 100%;
  }
</style>

<div class="body">
  <section>
    <Editor bind:irmd />
  </section>
  <section>
    <Output {irmd} />
  </section>
</div>
