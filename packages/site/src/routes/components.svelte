<script>
  import { kebabCase } from "lodash";

  import DocumentList from "../components/DocumentList.svelte";

  import componentsIntro from "../../static/components/intro.md";
  import vegaEmbed from "../../static/components/vega-embed.md";
  import plotlyJs from "../../static/components/plotlyjs.md";

  const components = [
    { content: componentsIntro, title: "Introduction" },
    { content: vegaEmbed, title: "Vega Lite" },
    { content: plotlyJs, title: "Plotly.js" },
  ].map((ex) => ({ ...ex, id: kebabCase(ex.title.toLowerCase()) }));
</script>

<svelte:head>
  <title>Components</title>
</svelte:head>

<DocumentList segment={"components"} documents={components} />
