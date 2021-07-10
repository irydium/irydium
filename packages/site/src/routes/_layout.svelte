<script lang="ts">
  import Nav from "../components/Nav.svelte";
  import NavItem from "../components/NavItem.svelte";
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

{#if segment !== 'login'}
  <Nav {segment}>
    <NavItem segment={'examples'} />
    <NavItem segment={'repl'} />
  </Nav>
  <main>
    <slot />
  </main>
{:else}
  <slot />
{/if}
