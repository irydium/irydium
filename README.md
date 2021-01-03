# Iridium

This is a _very_ early prototype of a successor to [Iodide](https://alpha.iodide.io), trying to workaround some of its limitations while also experimenting with other new ideas (e.g. extreme reactivity, extensibility, etc.). For more information on what inspired it, see:

https://wlach.github.io/blog/2020/11/iodide-retrospective/

You can see Iridium in action on Heroku:

https://iridium-prototype.herokuapp.com/

## Getting Started

If you want to try creating irmd documents and compiling them to HTML, you can install [@iridium-project/compiler](https://www.npmjs.com/package/@iridium-project/compiler) from npm:

```bash
npm install -g @iridium-project/compiler
irmd-compile document.irmd
```

If you want to hack on the iridium itself or the demo site, try this workflow:

```bash
npm install
npm run bootstrap
npm run dev
```

A local copy of the site above should be accessible via http://localhost:3000/
