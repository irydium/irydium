# Irydium

[![Build Status](https://github.com/irydium/irydium/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/irydium/irydium/actions?query=workflow%3Abuild-and-test)

This is a _very_ early prototype of a successor to [Iodide](https://alpha.iodide.io), trying to workaround some of its limitations while also experimenting with other new ideas (e.g. extreme reactivity, extensibility, etc.). For more information on what inspired it, see:

https://wlach.github.io/blog/2020/11/iodide-retrospective/

You can see Irydium in action on Heroku:

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
