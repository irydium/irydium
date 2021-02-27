# Irydium

This is a _very_ early prototype of a successor to [Iodide](https://alpha.iodide.io), trying to workaround some of its limitations while also experimenting with other new ideas (e.g. extreme reactivity, extensibility, etc.). For more information on what inspired it, see:

https://wlach.github.io/blog/2020/11/iodide-retrospective/

You can see Irydium in action on Heroku:

https://irydium-prototype.herokuapp.com/

## Getting Started

If you want to try creating irmd documents and compiling them to HTML, you can install [@irydium/compiler](https://www.npmjs.com/package/@irydium/compiler) from npm:

```bash
npm install -g @irydium/compiler
irmd-compile document.irmd
```

If you want to hack on the demo site, try this workflow:

```bash
npm install
npm run bootstrap
npm run site-dev
```

A local copy of the site above should be accessible via http://localhost:3000/
