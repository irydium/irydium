---
scripts: ["https://d3js.org/d3-dsv.v1.min.js"]
data:
  - eviction_notice_csv: https://data.sfgov.org/api/views/5cei-gny5/rows.csv?accessType=DOWNLOAD
imports:
  - /components/vega-embed.md#VegaEmbed
variables:
  - chart_display: "bar"
---

# Irydium prototype

This is a basic Irydium document, designed to demonstrate some of the concepts of this project.
In some ways Irydium will feel familiar to those coming from environments like [Jupyter], but it is more focused on _reproducible presentation_. For more information, see the [project README].

This introduction is best viewed side-by-side with its markdown representation, so you can see how what you write gets rendered to the screen.

For a nice, simple demo, let's pull down some data and render it using [vega-embed], a popular JavaScript visualization library.
This will show some basic workflows that irydium makes possible.

If you're viewing this in markdown mode, you'll see in the header right on top, which looks like this:

```yaml
scripts: ["https://d3js.org/d3-dsv.v1.min.js"]
data:
  - eviction_notice_csv: https://data.sfgov.org/api/views/5cei-gny5/rows.csv?accessType=DOWNLOAD
imports:
  - https://raw.githubusercontent.com/irydium/irydium/main/packages/site/src/examples/vega-embed.md#VegaEmbed
variables:
  - chart_display: "bar"
```

The first is a set of scripts to load. In this case, we're loading a [d3-dsv], to load a CSV file.
The second block describes data that we want to load. `eviction_notice_csv` as the name implies, is
a CSV containing a database of collected eviction notices from the San Francisco government.

One of the main ideas in Irydium is the _task list_. Individual tasks have `inputs` (dependencies) and `outputs` (which can either be used as inputs in subsequent tasks _or_ presented in the final output in some way).
An irydium document resolves these dependencies at run time, starting with those with no inputs.
Both the "data" and "scripts" objects we discussed are examples of this type of input.

One place where this model is particularly useful is creating a pipeline of ETL (extract-transform-load) operations.
The eviction notice dataset is in CSV format which irydium doesn't natively understand: we will want to process it into a set of JavaScript objects.
Let's create a code cell to do this, using the data we just downloaded as an input:

```{code-cell} js
---
id: "eviction_notices"
inputs: [ "eviction_notice_csv" ]
inline: true
---
let eviction_notice_text = await eviction_notice_csv.text();
let parsed = d3.csvParse(eviction_notice_text);
console.log(parsed);
return parsed;
```

A couple of things to note about this:

- You can see that the above cell has YAML-based frontmatter. `inputs` and `output` were discussed above, `inline` tells irydium that it should also output the content of the code chunk into the resulting document (by default, it hides code chunk -- in line with the philosophy that a rendered irydium document should be optimized for reading).
- You can see a call to `console.log` in the code above. This will appear in your browser's developer console and can be handy when trying to figure out what your notebook is doing (using a debugger should also work fine).

Now that we have some prepared data, we can try to do something with it.
Let's do a count of eviction notices by year.
We'll write up some basic JavaScript to do some map-reduce operations here to get this output:

```{code-cell} js
---
id: eviction_notices_per_year
inputs: [eviction_notices]
inline: true
---
const years = eviction_notices.map(n=> {
  return n["File Date"].split("/")[2];
});
const yearCounts = years.reduce((acc, y) => { return acc[y] === undefined ? {...acc, [y]: 1} : {...acc, [y]: acc[y]+1} }, {})
return Object.keys(yearCounts).map(year => ({year, count: yearCounts[year]}));
```

Since we're planning to use VegaLite to display the results, we'll need to create a vegalite spec to define how the graph should be represented.
We can do this with a code cell as well:

```{code-cell} js
---
id: vegaspec
inputs: [eviction_notices_per_year, chart_display]
inline: true
---
return {
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "description": "A simple bar chart with embedded data.",
  "width": 600,
  "data": {
    "values": eviction_notices_per_year
  },
  "mark": chart_display,
  "encoding": {
    "x": {"field": "year", "type": "ordinal"},
    "y": {"field": "count", "type": "quantitative"},
    "tooltip": {"field": "count", "type": "quantitative"}
  }
}
```

Of course, we also want to display the results.
At this point in Irydium's development, the recommended way of doing this is by using a Svelte component.
If you're not familiar with Svelte, it's a fantastic library for quickly building interactive web sites using a syntax that should feel very familiar if you know even a little bit of HTML, CSS, and JavaScript.

To avoid the need to continually re-specify common patterns like visualizations, Irydium supports importing
Svelte components defined in another notebook.
In this case we'll import a `VegaEmbed` component from the notebook defined at <https://raw.githubusercontent.com/irydium/irydium/main/packages/site/src/examples/vega-embed.md#VegaEmbed> -- if you're viewing this from the Irydium examples, see the "Vega Embed" notebook for the definition.

To make this visualization interactive, we'll also create a select element that allows you to change the `chart_display` variable used in the VegaLite spec we defined above.
We can bind to this variable via a select node to make it reactive by adding this to the source: see
[the svelte documentation](https://svelte.dev/tutorial/component-bindings) for more on this concept,
this will let us toggle between "line" and "bar" charts.
Since this is a reactive declaration, everything depending on it (up to and including the chart itself) updates when you switch the toggle:

```html
<select bind:value={chart_display}>
  <option value={"line"}>
    Line
  </option>
  <option value={"bar"}>
    Bar
  </option>
</select>
```

Putting these two concepts together, we now have a basic reactive visualization that you can interact with:

## Eviction counts in San Francisco by Year

<select bind:value={chart_display}>
  <option value={"line"}>
    Line
  </option>
  <option value={"bar"}>
    Bar
  </option>
</select>

<VegaEmbed spec={vegaspec} />

🎉 You now understand the basics of creating a visualization with explanatory text using irydium.

[jupyter]: https://jupyter.org/
[svelte]: https://svelte.dev/
[project readme]: https://github.com/irydium/irydium/blob/main/README.md
[vega-embed]: https://github.com/vega/vega-embed
[d3-dsv]: https://github.com/d3/d3-dsv
[mdsvex]: https://mdsvex.com/
