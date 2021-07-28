---
title: Irydium ❤️ Python
imports:
  - /examples/plotlyjs.md#Plotly
---

# {title}

Irydium supports running python cells, through [pyodide](https://pyodide.org)!
This feature is preliminary: we are still working on getting the ergonomics right.

Here's some code which generates a basic sine wave in Python (based off of the
original [A Brief Tour through Pyodide](https://alpha.iodide.io/notebooks/300/)):

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