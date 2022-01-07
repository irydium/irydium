---
title: Irydium ❤️ Python
imports:
  - /components/plotlyjs.md#Plotly
---

# {glue:}`title`

Irydium supports running python cells, through [pyodide](https://pyodide.org)!
This feature is preliminary: we are still working on getting the ergonomics right.
You may also be interested in the [component](/components#python-via-pyodide) where Irydium defines support for Python.

As a quick demonstration, here's some code which generates a basic sine wave in Python (based off of the original [A Brief Tour through Pyodide](https://alpha.iodide.io/notebooks/300/)):

```{code-cell} python
---
id: sinwave
inline: true
---

import numpy as np
x = np.linspace(0, 2.0 * np.pi, 100)
y = np.sin(x)
[{'x': x, 'y': y}]
```

And here's its output in a Plotly graph:

<Plotly data={sinwave} />
