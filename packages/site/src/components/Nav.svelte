<script lang="ts">
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

  export let segment: string;

  const current = writable(null);
  setContext("current", current);
  $: {
    $current = segment;
  }
</script>

<style>
  .title {
    font-size: 2.5rem;
    padding: 0.25em;
    display: block;
    font-weight: bold;
  }

  .title a {
    text-decoration: none;
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

  ul {
    float: right;
  }
</style>

<nav>
  <div class="title"><a href="/">Irydium</a></div>
  <ul>
    <slot />
  </ul>
</nav>
