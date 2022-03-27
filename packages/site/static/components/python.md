---
title: Python Language Plugin
variables:
  - sin_multiple: 2
imports:
  - /components/plotlyjs.md#Plotly
---

# Python Language Plugin

Irydium supports the ideas of language plugins, defined inside the document itself.
This has many advantages, but one interesting benefit is that it lets us prototype support for interesting and/or experimental language runtimes.
In this case, we'll use this feature to allow Irydium to support Python via [pyodide].

This particular plugin is always available when you're using Irydium: no need to import it explicitly.
However, if you wish to override the plugin in your own document (e.g. to test an in-development version of Pyodide), you can do so by copying and pasting the declaration below into it:

```{code-cell} js
---
id: python
type: language-plugin
scripts: https://cdn.jsdelivr.net/pyodide/v0.20.0a1/full/pyodide.js
inline: true
---
const pyodide = await loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.20.0a1/full/",
});

return async (inputs, code) => {
	await pyodide.loadPackagesFromImports(code);
  const result = await pyodide.runPythonAsync(code, { globals: pyodide.toPy(inputs) });
  // if result has type conversion code, then use that (eventually may want to pass things
  // directly if two python cells are chained to each other)
  if (result && result.toJs) {
    return result.toJs({dict_converter : Object.fromEntries});
  }
  return result;
}
```

Here's an example of using the above-defined plugin to return the value of "pi":

```{code-cell} python
---
id: pi
inline: true
---
import math

math.pi
```

{glue:}`pi`

And here's a somewhat more involved example which creates a sine wave and renders it via plotly.
To make things interesting, we'll use a variable as an input parameter.

```{code-cell} python
---
id: sinwave
inline: true
inputs: [sin_multiple]
---
import numpy as np
x = np.linspace(0, sin_multiple * np.pi, 100)
y = np.sin(x)
[{'x': x, 'y': y}]
```

And here's its output in a Plotly graph.
Try toggling the value in the dropdown to see how the result changes.

<select bind:value={sin_multiple}>
  <option value={2}>
    2
  </option>
  <option value={4}>
    4
  </option>
  <option value={8}>
    8
  </option>
</select>

<Plotly data={sinwave} />

[pyodide]: https://pyodide.org
