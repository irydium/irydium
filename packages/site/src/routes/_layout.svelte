<script lang="ts">
  import Nav from "../components/Nav.svelte";
  import { setupStore } from "../state/sessionStore";

  export let segment: string;

  setupStore();
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
