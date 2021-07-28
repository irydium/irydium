---
title: Plotly.js
scripts:
  - https://cdn.plot.ly/plotly-latest.min.js
---

# {title}

As an alternative to [Vega-lite](https://vega.github.io/vega-lite/), you can also use [Plotly.js](https://plotly.com/javascript/) to add interactive visualizations to your documents by importing this page (see the "Introduction") and embedding a `<Plotly />` component.

Here's the definition of a component:

```{code-cell} svelte
---
id: Plotly
---
<script>
  import { onMount } from 'svelte';

  export let data = undefined;
  let dom_node;

  onMount(() => {
    // pyodide returns some objects as maps, which plotly doesn't understand
    let transformed = data.map(d=>d instanceof Map ? Object.fromEntries(d.entries()) : d);
    console.log(transformed)
    Plotly.newPlot(dom_node, transformed);
  });
</script>

<div bind:this={dom_node}></div>
```

Here's some sample data:

```{code-cell} js
---
id: sampleData
inline: true
---

return [{ x: ['giraffes', 'orangutans', 'monkeys'], y: [20, 14, 23], type: 'bar' }];
```

And the result looks like this (if we embed: `<Plotly data={sampleData} />`):

<Plotly data={sampleData} />
