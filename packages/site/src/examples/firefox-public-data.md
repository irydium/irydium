---
title: Firefox Public Data Report
scripts:
  [
    https://cdn.jsdelivr.net/npm/arquero@latest,
    https://cdn.plot.ly/plotly-latest.min.js,
  ]
data:
  - os_data_raw: https://data.firefox.com/datasets/desktop/hardware/default/osName/index.json
---

# {title}

This example attempts to reproduce a subset of the [Firefox Public Data Report].
We use [arquero] to transform the data and [plotly.js] to plot the results.

[firefox public data report]: https://data.firefox.com/
[arquero]: https://uwdata.github.io/arquero
[plotly.js]: https://plotly.com/javascript/

## Operating System Distribution

This is a straightforward reproduction of the operating chart at [hardware section], but using plotly.js instead of an older version of MetricsGraphics to render the charts.
Try clicking (or double clicking!) on the elements of the legend to get a "zoomed in" picture of the trends.
Some things become much more obvious when you look at them individually.

<PlotlyGraph data={os_data} />

[hardware section]: https://data.firefox.com/dashboard/hardware

## Operating System Distribution (Grouped)

As [this post] to the Discourse instances indicates, we can sometimes get more interesting results by grouping some categories together (i.e. instead of breaking out each version of Linux together, look at them one-by-one).
Let's see how that might work.
Again, try clicking (or double clicking!) on the elements of the legend to get a "zoomed in" picture of the trends.

[this post]: https://discourse.mozilla.org/t/some-hardware-reports-could-yield-more-interesting-information-than-they-currently-do/49462

<PlotlyGraph data={os_data_grouped} />

```{code-cell} js
---
id: os_data
inputs: [os_data_raw]
---
// basic transformation of Firefox Data Report data into what we'd expect
const transformed = Object.entries(os_data_raw.data.populations).map(([name, values]) => {
  return { name, x: values.map(v=>new Date(v.x)), y: values.map(v=>v.y)}
});
return transformed;
```

```{code-cell} js
---
id: os_data_grouped
inputs: [os_data_raw]
---
// transform the data into the format arq expects
const transformed = Object.entries(os_data_raw.data.populations).map(([name, values]) => {
  return values.map(v=>({name, date: new Date(v.x), value: v.y}));
}).flat();

// add a function to truncate the operating system down to what we'd expect
aq.addFunction('truncate_os', d=>d.split(/-| /)[0], { override: true });
const df = aq.from(transformed);
const summed = df
  .dedupe()
  .derive({
    name: d=>op.truncate_os(d.name)}
  )
  .groupby(['date', 'name'])
  .rollup({total: d=> op.sum(d.value)}).objects();

// transform back into a form plotly can understand
const grouped = Object.entries(summed.reduce((acc, curr) => {
  if (!acc[curr.name]) {
    acc[curr.name] = [];
  }
  acc[curr.name].push({x: curr.date, y: curr.total});
  return acc;
}, {})).map(([name, values]) => {
  return {name, x: values.map(v=>v.x), y: values.map(v=>v.y)}
});

return grouped;
```

```{code-cell} svelte
---
id: PlotlyGraph
---
<script>
  import { onMount } from 'svelte';

  export let data = undefined;
  let dom_node;

  onMount(() => {
    Plotly.newPlot(dom_node, data);
  });
</script>

<div id="plotDiv" bind:this={dom_node}></div>
```
