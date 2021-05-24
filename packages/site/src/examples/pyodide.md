---
title: Irydium ❤️ Python
scripts:
  - https://cdn.plot.ly/plotly-latest.min.js
components:
  - https://github.com/irydium/irdium/files/blah/document.md#PlotlyGraph
---

# {title}

Irydium supports running python cells, through [pyodide](https://pyodide.org)!
This feature is preliminary: we are still working on getting the ergonomics right.

Here's some code which generates a basic sine wave in Python (based off of the
original [A Brief Tour through Pyodide](https://alpha.iodide.io/notebooks/300/)):

```{code-cell} python
---
output: sinwave
inline: true
---

import numpy as np
x = np.linspace(0, 2.0 * np.pi, 100)
y = np.sin(x)
[{'x': x, 'y': y}]
```

And here's its output in a Plotly graph:

<PlotlyGraph data={sinwave} />

```{code-cell} svelte
---
name: PlotlyGraph
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
