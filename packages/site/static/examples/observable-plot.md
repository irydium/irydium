---
scripts:
  - https://d3js.org/d3-dsv.v1.min.js
  - https://cdn.jsdelivr.net/npm/d3@6
  - https://cdn.jsdelivr.net/npm/@observablehq/plot@0.1
data:
  - big_mac_csv: https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-adjusted-index.csv
---

# Using Observable Plot

You can use [Observable Plot] to create interactive visualizations.
This has the advantage of being able to render directly in a code cell, as is the case with [Observable].
In the case, we'll visualize a couple of entries from the Economist's [Big Mac Index].

## Preparing the data

We'll use d3.csvParse, as in other examples.

```{code-cell} js
---
id: "big_mac"
inputs: [ "big_mac_csv" ]
inline: true
---
return d3.csvParse(await big_mac_csv.text(), d3.autoType);
```

## Rendering the data

Let's use a simple line plot.

```{code-cell} js
---
inputs: [big_mac]
inline: true
---
const countryFilter = (d) => ["Canada", "China", "United States"].includes(d.name);

return Plot.plot({
  y: { grid: true },
  width: 800,
  marginRight: 80,
  marks: [
    Plot.line(big_mac, {filter: countryFilter, x: "date", y: "dollar_price", stroke: "name" }),
    Plot.text(big_mac, Plot.selectLast({filter: countryFilter, x: "date", y: "dollar_price", z: "name", text: "name", textAnchor: "start", dx: 3}))
  ]
});
```

[observable plot]: https://github.com/observablehq/plot
[observable]: https://observablehq.com/@observablehq
[big mac index]: https://en.wikipedia.org/wiki/Big_Mac_Index
