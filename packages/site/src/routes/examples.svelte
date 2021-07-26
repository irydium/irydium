<script>
  import Editor from "../components/Editor.svelte";
  import Output from "../components/Output.svelte";
  import intro from "../examples/intro.md";
  import ffxData from "../examples/firefox-public-data.md";
  import gcpBurndown from "../examples/gcp-burndown.md";
  import pyodide from "../examples/pyodide.md";
  import mystSupport from "../examples/myst-support.md";
  import vegaEmbed from "../examples/vega-embed.md";
  import plotlyJs from "../examples/plotlyjs.md";

  let examples = [
    { content: intro, title: "Introduction" },
    { content: pyodide, title: "Using Python" },
    { content: mystSupport, title: "MyST Directives" },
    { content: vegaEmbed, title: "Vega Lite" },
    { content: plotlyJs, title: "Plotly.js" },
    { content: gcpBurndown, title: "GCP Burndown" },
    { content: ffxData, title: "Firefox Data Report" },
  ];

  let selectedExample = examples[0];
  let md = selectedExample.content;
  let editor;

  function updateSelected(newSelected) {
    selectedExample = newSelected;
    md = newSelected.content;
    editor.updateMd(md); // pass through updated state to codemirror
  }
</script>

<svelte:head>
  <title>Examples</title>
</svelte:head>

<div class="body">
  <section class="example-list">
    <ul>
      {#each examples as example}
        <li>
          <span
            aria-current={example.title === selectedExample.title
              ? "example"
              : undefined}
            on:click={() => updateSelected(example)}>{example.title}</span
          >
        </li>
      {/each}
    </ul>
  </section>
  <section>
    <Editor bind:this={editor} bind:md />
  </section>
  <section>
    <Output {md} />
  </section>
</div>

<style>
  .body {
    position: relative;
    display: grid;
    grid-template-columns: 200px repeat(2, 1fr);
    grid-template-rows: 100% auto;
    gap: 0px;
    width: 100%;
    height: 100%;
  }

  section {
    height: calc(100vh - var(--nav-h));
  }

  .example-list ul {
    list-style: none;
    list-style-type: none;
    padding: 0;
  }

  .example-list li {
    padding: 8px 8px 8px 16px;
    cursor: pointer;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 2px;
    background-color: rgb(255, 62, 0);
    display: block;
    bottom: -1px;
  }
</style>
