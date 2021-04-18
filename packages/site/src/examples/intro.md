# Irydium prototype

This is a basic Irydium document, designed to demonstrate some of the concepts of this
project. In some ways Irydium will feel familiar to those coming from environments
like [Jupyter](https://jupyter.org/), but it is more focused on _reproducible
presentation_:

- The end-product is designed to be a self-contained web page and omits programmatic
  details regarding how it was produced.
- Unlike a Jupyter notebook, where the user interacts with a "language kernel" and
  constructs state in an adhoc manner inside language cells (with results serialized
  to disk), Irydium is designed to be [idempotent](https://en.wikipedia.org/wiki/Idempotence):
  that is, a given Irydium notebook should display the _same_ results each time it is run.
  To make this process efficient, the notebook is defined as a [Directed Acyclic Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
  (DAG) so only portions which have changed need to be recomputed.
- Irydium is designed to be "web native"-- that is to say, while various options for
  offline computation and notebook-building exist, it can also be run entirely inside
  the browser and the full ecosystem of web visualization libraries is available and
  usable, with no plugins required.

To make all of this work, Irydium is built on top of some of great building blocks:

- [Svelte](https://svelte.dev): A next-generation JavaScript-based web framework
- [mdsvex](https://mdsvex.com): An efficient means of transforming a markdown document into a Svelte component
- [Rollup](https://rollupjs.org/): An efficient bundler for JavaScript-based web components
- [pyodide](https://github.com/iodide-project/pyodide): A port of Python to WebAssembly
