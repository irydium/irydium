# Irydium

[![Build Status](https://github.com/irydium/irydium/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/irydium/irydium/actions?query=workflow%3Abuild-and-test)

Irydium is a set of tooling designed to allow people to create interactive documents
using web technologies. It will feel familiar to those coming from environments
like [Jupyter](https://jupyter.org/), but has some key differences.

- The input process is a markdown document (using the [MyST](https://jupyterbook.org/content/myst.html)
  flavour of Markdown).
- The end-product is designed to be a self-contained web page and omits programmatic
  details regarding how it was produced.
- Unlike a Jupyter notebook, where the user interacts with a "language kernel" and
  constructs state in an adhoc manner inside language cells (with results serialized
  to disk), Irydium is designed to be [idempotent](https://en.wikipedia.org/wiki/Idempotence):
  that is, a given Irydium notebook should display the _same_ results each time it is run.
  To make this process efficient, the notebook is defined as a [Directed Acyclic Graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG) so only portions which have changed need to be recomputed.
- Irydium is designed to be "web native"-- that is to say, while various options for
  offline computation and notebook-building exist, it can also be run entirely inside
  the browser and the full ecosystem of web visualization libraries is available and
  usable, with no plugins required.
- Irydium is agnostic about how you produce your document: its input is a plain markdown document, its output is
  a self-contained HTML bundle that can be served by any static webserver.
  There is a viewer application ("irmd-viewer") with some debugging affordances which you can use to
  interactively create a document.
  When you're happy with it, you can produce a final bundle using `irmd-compile`.
  An online interactive editing and collaboration environment is in development (you can see an early prototype of this below) but will never be required.

To make this work, Irydium uses some of great building blocks:

- [Svelte](https://svelte.dev): A next-generation JavaScript-based web framework
- [mdsvex](https://mdsvex.com): An efficient means of transforming a markdown document into a Svelte component
- [Rollup](https://rollupjs.org/): An efficient bundler for JavaScript-based web components
- [pyodide](https://github.com/iodide-project/pyodide): A port of Python to WebAssembly

You can see a very early version of Irydium in action on the demonstration site:

https://irydium.dev/

## Getting started with Irydium

Irydium, at heart, is just a set of tools for translating markdown documents into web pages
(and maybe someday soon, parts of web pages that may be embedded elsewhere).
If you want to try creating irmd documents and converting them to HTML, you can install [@irydium/compiler](https://www.npmjs.com/package/@irydium/compiler) from npm:

```bash
npm install -g @irydium/compiler
```

Then you can convert any document into HTML via the `irmd-compile` command:

```bash
irmd-compile README.md > README.html
```

If you want to be able to preview your document as you edit it, you can install the `irmd-viewer`
command:

```bash
npm install -g @irydium/viewer
```

```bash
irmd-viewer README.md
```

This will start a webserver on http://localhost:3000/. The rendered document will update as you
modify and save the underlying markdown document.
There are also a few debugging affordances: being able to view the chain of computational operations as a graph, as well as being able to switch dynamically between several intermediate representations of the document.

If you use Visual Studio Code, you may find the [MyST Visual Studio Code extension] helpful:
it will add syntax highlighting to code cells, as well as the other directives that the MyST flavor of Markdown provides.

[myst visual studio code extension]: https://github.com/executablebooks/myst-vs-code

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

This will auto-reload your site if either the irydium source files or your document changes.

### Working on the site

If you want to hack on the irydium site, try this workflow:

```bash
npm run dev-site
```

A local copy of the site above should be accessible via http://localhost:3000/

Most of the site's functionality should work as-is without further setup.
However, to test saving/loading documents, you will need a [supabase] account and set up a GitHub
OAuth.

Roughly:

1. Create a new supabase project in your organization
2. Create a new OAuth application under your individual or organization's "OAuth Apps" (under "Developer Settings"),
   take note of the client id and secret.
3. Set up supabase authentication to allow GitHub, and paste in the client information you took note of above.
4. Create a `.env` file in the root of the irydium folder, with the following contents copied over from "Settings / API" in Supabase:

```
SUPABASE_URL=<url>
SUPABASE_ANON_KEY=<key>
```

5. Update the callback URL for your OAuth application on GitHub to: `https://<SUPABASE_URL>/auth/v1/callback`(substituting the value you pasted in above for `<SUPABASE_URL>`)
6. Run the following command to set up a database table to support saving irydium documents:

```sql
create table documents (
  id uuid DEFAULT uuid_generate_v1(),
  user_id uuid references auth.users not null,
  updated_at timestamp with time zone not null DEFAULT now(),
  content varchar not null,
  title text not null,

  primary key (id)
);

alter table documents enable row level security;

create policy "Documents are viewable by everyone."
  on documents for select
  using ( true );

create policy "Users can insert their own documents."
  on documents for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own documents."
  on documents for update
  using ( auth.uid() = user_id );
```

[supabase]: https://supabase.io
