---
title: Vega-Lite
---

# {glue:}`title`

You can use [Vega-lite](https://vega.github.io/vega-lite/) to add interactive visualizations to your documents by importing this page (see the "Introduction") and creating a `vegalite` code-cell.

Here's the definition of a component:

```{code-cell} js
---
id: vegalite
type: language-plugin
scripts:
  - https://cdn.jsdelivr.net/npm/vega@5
  - https://cdn.jsdelivr.net/npm/vega-lite@5
  - https://cdn.jsdelivr.net/npm/vega-embed/build/vega-embed.js
inline: true
---
return async (inputs, code) => {
  const dom_node = document.createElement('div');
  const stringifiedInputs = Object.fromEntries(Object.entries(inputs).map(([k,v]) => [k, JSON.stringify(v)]));
  await vegaEmbed(dom_node, JSON.parse(_.template(code)(stringifiedInputs)))
    .then(result => console.log(result))
    .catch(console.warn);
  return dom_node;
}
```

Here's a simple example, lifted from [vega itself](https://vega.github.io/vega-lite/examples/bar.html):

```{code-cell} vegalite
---
inline: true
---
{
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

You can pass arguments to a vega spec using [underscore template encoding] and it will process them.
This templating format is admittedly bit obscure, but easy to learn.
For simple use cases, just put variables you would like to see in a `<%= %>` clause
(Irydium will automatically JSON-escape them).

[underscore template encoding]: https://2ality.com/2012/06/underscore-templates.html

For example, let's define a code cell which randomly generates values for the bar chart above:

```{code-cell} js
---
id: vals
inline: true
---

return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(v => ({a: v, b: Math.random()}));
```

Then we can add it as a dependency, and insert the results into a "values" clause below:

```{code-cell} vegalite
---
inline: true
inputs: [vals]
---
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "description": "A simple bar chart with embedded data.",
  "data": {
    "values": <%= vals %>
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "b", "type": "quantitative"}
  }
}
```
