<script lang="ts">
  export let segment: string;
</script>

<style>
  .title {
    font-size: 2.5rem;
    padding: 0.25em;
    display: block;
    font-weight: bold;
  }
  nav {
    border-bottom: 1px solid rgba(255, 62, 0, 0.1);
    font-weight: 300;
    padding: 0 2em 0 2em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nav-h);
  }

  ul {
    margin: 0;
    padding: 0;
  }

  /* clearfix */
  ul::after {
    content: "";
    display: block;
    clear: both;
  }

  li {
    display: block;
    float: left;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: "";
    width: calc(100% - 1em);
    height: 2px;
    background-color: rgb(255, 62, 0);
    display: block;
    bottom: -1px;
  }

  a {
    text-decoration: none;
    padding: 1em 0.5em;
    display: block;
  }

  ul {
    float: right;
  }
</style>

<nav>
  <div class="title">Irydium</div>
  <ul>
    <li>
      <a
        aria-current={segment === undefined ? 'page' : undefined}
        href=".">home</a>
    </li>
    <li>
      <a
        aria-current={segment === 'repl' ? 'page' : undefined}
        href="repl">repl</a>
    </li>
  </ul>
</nav>
