---
scripts:
  [
    "https://d3js.org/d3-dsv.v1.min.js",
    "https://cdn.jsdelivr.net/npm/vega@5",
    "https://cdn.jsdelivr.net/npm/vega-lite@5",
    "https://cdn.jsdelivr.net/npm/vega-embed/build/vega-embed.js",
  ]
data:
  - eviction_notice_csv: https://data.sfgov.org/api/views/5cei-gny5/rows.csv?accessType=DOWNLOAD
---

# Irydium prototype

This is a basic Irydium document, designed to demonstrate some of the concepts of this
project. In some ways Irydium will feel familiar to those coming from environments
like [Jupyter](https://jupyter.org/), but it is more focused on _reproducible
presentation_. For more information, see the [project README].

This introduction is designed to be viewed side-by-side with its markdown representation,
so you can see how what you write gets rendered to the screen.

For a nice, simple demo, let's pull down some data and render it using [vega-embed],
a popular JavaScript visualization library. This will show some basic workflows that irydium
makes possible.

If you're viewing this in markdown mode, you'll see in the header right on top there's a data element,
describing eviction notices:

```yaml
data:
  - eviction_notice_csv: https://data.sfgov.org/api/views/5cei-gny5/rows.csv?accessType=DOWNLOAD
```

One of the primary ideas in Irydium is that of the task list. Individual tasks have `inputs` (dependencies)
and `outputs` (dependencies of subsequent tasks). An irydium document resolves these dependencies at run
time, starting with those with no inputs. "data" imports (expressed in the frontmatter of the document)
are examples of these inputs.

`eviction_notice_csv` as the name implies, is a CSV containing a database of collected eviction notices from the San Francisco government. As the name implies, it's in CSV format which irydium doesn't natively understand: we will
want to process it into a set of JavaScript objects. Let's create a code cell to do this (you won't see this unless you're viewing the original markdown), using `eviction_notice_csv` as input:

...

```{code-cell} js
---
inputs: [ "eviction_notice_csv" ]
output: "eviction_notices"
---
let eviction_notice_text = await eviction_notice_csv.text();
console.log(eviction_notice_text.slice(0,1024));
let parsed = d3.csvParse(eviction_notice_text);
return parsed
```

You'll note that when running this, we have a call to `console.log`.
This will appear in your browser's developer console and can be handy for "debugging" an irydium document.

Now that we have some prepared data, we can try to do something with it. Let's do a count of eviction
notices by year. We'll write up some basic JavaScript to do some MapReduce operations here.

...

```{code-cell} js
---
inputs: [eviction_notices]
output: eviction_notices_per_year
---
const years = eviction_notices.map(n=> {
  return n["File Date"].split("/")[2];
});
const yearCounts = years.reduce((acc, y) => { return acc[y] === undefined ? {...acc, [y]: 1} : {...acc, [y]: acc[y]+1} }, {})
const yearArray = Object.keys(yearCounts).map(year => ({year, count: yearCounts[year]}));
console.log(yearArray);
return yearArray;
```

Finally, we'll want to display the results. Soon we may allow a JavaScript code cell in Irydium to return an
SVG or HTML element which means we could call Vega-Embed directly, however for now the best way of doing
this is by creating a svelte component and calling the visualization library inside there. Let's try that:

...

```{code-cell} svelte
---
name: VegaEmbed
---
<script>
  import { onMount } from 'svelte';

  export let spec = undefined;
  let dom_node;

  onMount(() => {
    console.log(dom_node);
    vegaEmbed(dom_node, spec)    	// result.view provides access to the Vega View API
      .then(result => console.log(result))
      .catch(console.warn);
  });
</script>

<!-- Weird CSS issue with vegaEmbed, it seems to want height to be 100% -->
<div style="height: 320px">
  <div bind:this={dom_node}></div>
</div>
```

We'll need to create a vegalite spec to define how the graph should be represented, let's set that up too:

...

```{code-cell} js
---
inputs: [eviction_notices_per_year]
output: vegaspec
---

return {
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "description": "A simple bar chart with embedded data.",
  "width": 600,
  "data": {
    "values": eviction_notices_per_year
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "year", "type": "ordinal"},
    "y": {"field": "count", "type": "quantitative"},
    "tooltip": {"field": "count", "type": "quantitative"}
  }
}
```

Finally, let's insert this into the document.

## Eviction counts in San Francisco by Year

<VegaEmbed spec={vegaspec} />

🎉 You now understand the basics of creating a visualization with explanatory text using irydium.

[project readme]: https://github.com/irydium/irydium/blob/main/README.md
[vega-embed]: https://github.com/vega/vega-embed
