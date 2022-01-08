---
title: Vega-Lite
---

# {glue:}`title`

You can use [Vega-lite](https://vega.github.io/vega-lite/) to add interactive visualizations to your documents by importing this page (see the "Introduction") and embedding a `<VegaEmbed />` component.

Here's the definition of a component:

```{code-cell} svelte
---
id: VegaEmbed
scripts:
  - https://cdn.jsdelivr.net/npm/vega@5
  - https://cdn.jsdelivr.net/npm/vega-lite@5
  - https://cdn.jsdelivr.net/npm/vega-embed/build/vega-embed.js
inline: true
---
<script>
  import { onMount } from 'svelte';

  export let spec = undefined;
  let dom_node;

  onMount(() => {
    vegaEmbed(dom_node, spec)    	// result.view provides access to the Vega View API
      .then(result => console.log(result))
      .catch(console.warn);
  });

  $: {
    dom_node && vegaEmbed(dom_node, spec)
  }
</script>

<!-- Weird CSS issue with vegaEmbed, it seems to want height to be 100% -->
<div style="height: 320px">
  <div bind:this={dom_node}></div>
</div>
```

And here's a basic spec, taken from a [vega example](https://vega.github.io/vega-lite/examples/bar.html):

```{code-cell} js
---
id: basicSpec
inline: true
---
return {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": [
      {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
      {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
      {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}
```

And the result looks like this:

<VegaEmbed spec={basicSpec} />
