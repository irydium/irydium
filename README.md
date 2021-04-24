# Irydium

[![Build Status](https://github.com/irydium/irydium/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/irydium/irydium/actions?query=workflow%3Abuild-and-test)

Irydium is a set of tooling designed to allow people to create interactive presentations
using web technologies. It will feel familiar to those coming from environments
like [Jupyter](https://jupyter.org/), but it is more focused on _reproducible
presentation_.

- The input process is a markdown document (using the [MyST](https://jupyterbook.org/content/myst.html)
  flavour of Markdown).
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
- Irydium is agnostic about how you produce your document: its input is a plain markdown document, its output is
  a self-contained HTML bundle that can be loaded anywhere. There is currently a viewer application ("irmd-viewer")
  with minimal debugging affordances which you can use to interactively create a document. When you're happy with
  it, you can produce a final bundle using `irmd-compile`. An online interactive editing environment is planned
  (you can see an early prototype of this below).

To make all of this work, Irydium is built on top of some of great building blocks:

- [Svelte](https://svelte.dev): A next-generation JavaScript-based web framework
- [mdsvex](https://mdsvex.com): An efficient means of transforming a markdown document into a Svelte component
- [Rollup](https://rollupjs.org/): An efficient bundler for JavaScript-based web components
- [pyodide](https://github.com/iodide-project/pyodide): A port of Python to WebAssembly

You can see a very early version of Irydium in action on Heroku:

https://irydium-prototype.herokuapp.com/

## Getting Started

(FIXME: this does not currently work)

If you want to try creating irmd documents and compiling them to HTML, you can install [@irydium/compiler](https://www.npmjs.com/package/@irydium/compiler) from npm:

```bash
npm install -g @irydium/compiler
irmd-compile document.irmd
```

## Local development

There are a few options for local development. But the first step is to bootstrap
the local environment as follows:

```bash
npm install
npm run bootstrap
```

### Hacking on the irydium viewer

You can hack on the irydium viewer as follows:

```bash
npm run dev -- <path to file>
```

This will auto-reload your site if either the irydium source files or your document changes, making it ideal for local development workflows.

### Working on the site

If you want to hack on the irydium site, try this workflow:

```bash
npm run site-dev
```

A local copy of the site above should be accessible via http://localhost:3000/
