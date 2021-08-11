<script lang="ts">
  import Nav from "../components/Nav.svelte";
  import NavItem from "../components/NavItem.svelte";
  import { setupStore } from "../state/sessionStore";
  import Fa from "svelte-fa";
  import { faGithub } from "@fortawesome/free-brands-svg-icons";
  import { faComments } from "@fortawesome/free-regular-svg-icons";
  import LinkItem from "../components/LinkItem.svelte";

  export let segment: string;

  setupStore();
</script>

{#if segment !== "login"}
  <Nav {segment}>
    <NavItem segment={"examples"} />
    <NavItem segment={"components"} />
    <NavItem segment={"repl"} />
    <LinkItem href={"https://gitter.im/irydium/community"}>
      <Fa icon={faComments} />
    </LinkItem>
    <LinkItem href={"https://github.com/irydium/irydium"}>
      <Fa icon={faGithub} />
    </LinkItem>
  </Nav>
  <main>
    <slot />
  </main>
{:else}
  <slot />
{/if}

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
