<script>
  export let href = "";
</script>

<li>
  <a 
    href={href}><slot />
  </a>
</li>

<style>
  li {
    display: block;
    float: left;
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
