<script>
  import { kebabCase } from "lodash";

  import DocumentList from "../components/DocumentList.svelte";

  import intro from "../../static/examples/intro.md";
  import ffxData from "../../static/examples/firefox-public-data.md";
  import gcpBurndown from "../../static/examples/gcp-burndown.md";
  import pyodide from "../../static/examples/pyodide.md";
  import mystSupport from "../../static/examples/myst-support.md";
  import observablePlot from "../../static/examples/observable-plot.md";

  const examples = [
    { content: intro, title: "Introduction" },
    { content: pyodide, title: "Using Python" },
    { content: mystSupport, title: "MyST Directives" },
    { content: observablePlot, title: "Observable Plot" },
    { content: gcpBurndown, title: "GCP Burndown" },
    { content: ffxData, title: "Firefox Data Report" },
  ].map((ex) => ({ ...ex, id: kebabCase(ex.title.toLowerCase()) }));
</script>

<svelte:head>
  <title>Examples</title>
</svelte:head>

<DocumentList segment={"examples"} documents={examples} />
