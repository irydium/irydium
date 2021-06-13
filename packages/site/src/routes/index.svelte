<style>
  p {
    margin: 1em auto;
  }

  .body {
    padding: 6rem;
  }
</style>

<svelte:head>
  <title>Irydium</title>
</svelte:head>

<div class="body">
  <p>
    <strong>Irydium</strong>
    is an experiment in creating a dynamic environment for creating reactive
    explorations and data visualizations using a combination of
    <a href="https://daringfireball.net/projects/markdown/">Markdown</a>,
    JavaScript, HTML, and CSS. It takes inspiration from
    <a href="https://alpha.iodide.io">Iodide</a>,
    <a href="https://jupyter.org/">Jupyter Notebooks</a>
    and
    <a href="https://rmarkdown.rstudio.com/">Rmarkdown</a>.
  </p>
  <p>Key features:</p>
  <ul>
    <li>
      Use technologies you already know! An Irydium notebook is just Markdown,
      an easy-to-understand plaintext format, used and loved across the world
      wide web and beyond.
    </li>
    <li>
      Easy to reason about! An Irydium notebook implicitly executes the set of
      transformations required to generate a data visualization
      (Extract-Transform-Load) behind the scenes using an efficient scheduler.
      No need to write the same data munging boilerplate for the 100th time.
    </li>
    <li>
      Easy to share! Use whatever editor you prefer to write an Irydium
      notebook, then compile it into a fast and efficient web application using
      Irydium's command line tools.
    </li>
    <li>
      Easy to extend. Build custom, reactive visualizations using
      <a href="https://svelte.dev">Svelte</a>: right inside your document. No
      plugins required.
    </li>
  </ul>
  <p>Have a look at the <a href="/repl">repl</a>!</p>

  <p>
    Irydium is built using
    <a href="https://svelte.dev">Svelte</a>
    and
    <a href="https://mdsvex.com">mdsvex</a>.
  </p>
</div>
