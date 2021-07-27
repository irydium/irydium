<script>
  import { goto } from "@sapper/app";
  import { onMount } from "svelte";
  import { kebabCase } from "lodash";

  import Editor from "../components/Editor.svelte";
  import Output from "../components/Output.svelte";
  import intro from "../examples/intro.md";
  import ffxData from "../examples/firefox-public-data.md";
  import gcpBurndown from "../examples/gcp-burndown.md";
  import pyodide from "../examples/pyodide.md";
  import mystSupport from "../examples/myst-support.md";
  import vegaEmbed from "../examples/vega-embed.md";
  import plotlyJs from "../examples/plotlyjs.md";

  const examples = [
    { content: intro, title: "Introduction" },
    { content: pyodide, title: "Using Python" },
    { content: mystSupport, title: "MyST Directives" },
    { content: vegaEmbed, title: "Vega Lite" },
    { content: plotlyJs, title: "Plotly.js" },
    { content: gcpBurndown, title: "GCP Burndown" },
    { content: ffxData, title: "Firefox Data Report" },
  ].map((ex) => ({ ...ex, id: kebabCase(ex.title.toLowerCase()) }));

  let editor;

  const getFragment = () =>
    typeof window !== "undefined" && window.location.hash.slice(1);

  let selectedId = getFragment() || examples[0].id;
  let selectedExample;
  let md;

  $: {
    if (!selectedExample || selectedExample.id !== selectedId) {
      selectedExample =
        examples.find(({ id }) => id === selectedId) || examples[0];
      md = selectedExample.content;
      editor && editor.updateMd(md); // pass through updated state to codemirror
    }
  }

  onMount(() => {
    // shamelessly stolen from: https://github.com/sveltejs/svelte/blob/18780fac00ea21d7a21fbf815ffd0cd5048e5185/site/src/routes/examples/index.svelte#L76
    const onhashchange = () => {
      selectedId = getFragment();
    };
    window.addEventListener("hashchange", onhashchange, false);

    return () => {
      window.removeEventListener("hashchange", onhashchange, false);
    };
  });
</script>

<svelte:head>
  <title>Examples</title>
</svelte:head>

<div class="body">
  <section class="example-list">
    <ul>
      {#each examples as example}
        <li>
          <a
            aria-current={example.id === selectedId ? "example" : undefined}
            href={`/examples#${example.id}`}>{example.title}</a
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

  .example-list a {
    text-decoration: none;
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
