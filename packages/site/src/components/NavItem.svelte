<script>
  import { getContext } from "svelte";

  export let segment;
  const current = getContext("current");
</script>

<li>
  <a aria-current={segment === $current ? "page" : undefined} href={segment}
    >{segment}</a
  >
</li>

<style>
  li {
    display: block;
    float: left;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
    color: black;
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
    color: #555;
  }

  a:hover {
    color: black;
  }
</style>
