<script lang="ts">
  import Nav from "../components/Nav.svelte";

  export let segment: string;
</script>

<style>
  main {
    position: relative;
    background-color: white;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    align-items: stretch;
    flex: 1;
  }
</style>

<Nav {segment} />

<main>
  <slot />
</main>
