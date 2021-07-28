<svelte:head>
  <title>Irydium</title>
</svelte:head>

<div class="body">
  <p>
    <strong>Irydium</strong>
    lets you create compelling interactive documents and data visualizations using
    Markdown, JavaScript, Python, HTML, and CSS.
  </p>

  <div class="brag-items">
    <div>
      <h3>Easy to learn</h3>
      An Irydium notebook is just Markdown, an easy-to-understand plaintext format,
      used and loved across the world wide web and beyond.
    </div>
    <div>
      <h3>Easy to share</h3>
      Use the
      <a href="/repl">Irydium repl</a> or
      <i>whatever editor you prefer</i> to create your interactive document. When
      you're happy with what you've created, export it into a fast and efficient
      web site which stands on its own.
    </div>
    <div>
      <h3>Easy to extend</h3>
      Build custom, reactive visualizations using
      <a href="https://svelte.dev">Svelte</a>,
      <a href="https://d3js.org/">D3</a>, or
      <a href="https://www.python.org/">Python</a> and embed them right inside your
      document.
    </div>
  </div>

  <p>
    Irydium builds on top of existing standards and technologies, including:
  </p>

  <div class="brag-items">
    <div>
      <a href="https://svelte.dev"
        ><img alt="Svelte" src="/logos/svelte.svg" /></a
      >
    </div>
    <div>
      <a href="https://pyodide.org"
        ><img alt="pyodide" src="/logos/pyodide.png" /></a
      >
    </div>
    <div>
      <a href="https://myst-parser.readthedocs.io/"
        ><img alt="MyST Markdown" src="/logos/myst.svg" /></a
      >
    </div>
  </div>

  <p>
    For more information, see the
    <a href="https://github.com/irydium/irydium">Irydium project</a>
    on GitHub. Or check out the
    <a href="/examples">examples</a>!
  </p>
</div>

<style>
  p {
    margin: 1em auto;
  }

  .body {
    margin: 4rem auto;
    max-width: 120rem;
  }
  .body a {
    color: #0366d6;
  }

  .brag-items {
    margin: 4rem 0rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
  }

  .brag-items div {
    color: rgb(138, 127, 141);
    padding-left: 15px;
    padding-right: 15px;
    justify-self: center;
  }

  .brag-items h3 {
    color: black;
    margin: 0px 0px 10px;
  }

  .brag-items img {
    max-width: 20rem;
    margin: auto;
  }
</style>
