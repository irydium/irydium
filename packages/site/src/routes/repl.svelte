<script lang="ts">
  import { goto } from "@sapper/app";
  import {
    createLoginWindow,
    logout,
    getDocument,
    saveDocument,
  } from "../state/serverActions";
  import { user } from "../state/sessionStore";
  import intro from "../examples/repl.md";

  import Editor from "../components/Editor.svelte";
  import Output from "../components/Output.svelte";

  function getDocumentId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  async function loadMd() {
    if (typeof window === "undefined") return intro;

    const id = getDocumentId();
    if (!id) {
      return intro;
    }

    // FIXME: check for errors
    return await getDocument(id);
  }

  let md = "";
  let title = "";

  const loadingMd = loadMd().then((loadedMd) => {
    md = loadedMd;
    return loadedMd;
  });

  async function _login() {
    createLoginWindow();
  }

  async function _logout() {
    try {
      await logout();
    } catch (error) {
      alert(error.error_description || error.message);
    }
  }

  async function save() {
    const res = await saveDocument({
      content: md,
      title,
      ...(getDocumentId() ? { id: getDocumentId() } : {}),
    });
    if (res) {
      goto("/repl?id=" + res.id, { replaceState: true });
    }
    // FIXME: handle error states (exceptions, no document created)
  }
</script>

<style>
  .body {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: 100% auto;
    gap: 0px;
    width: 100%;
    height: 100%;
  }

  .repl-outer {
    height: 40px;
    background-color: #f6fafd;
    color: var(--comment);
  }

  .repl-outer div {
    padding: 8px;
  }

  .repl-outer .title {
    float: left;
    padding: 4px;
    padding-left: 20px;
    font-size: 20px;
  }
  .repl-outer .identity {
    float: right;
    padding-right: 20px;
  }

  section {
    height: calc(100vh - var(--nav-h));
  }
</style>

<svelte:head>
  <title>Repl</title>
</svelte:head>

<div class="repl-outer CodeMirror">
  <div class="title">{title}</div>
  <div class="identity">
    {#if $user}
      <button on:click={save}>Save</button>
      Logged in as
      <a href="/posts">{$user.email}</a>
      <button on:click={_logout}>Logout</button>
    {:else}<button on:click={_login}>Log in to save</button>{/if}
  </div>
</div>

{#await loadingMd}
  Loading...
{:then}
  <div class="body">
    <section>
      <Editor bind:md />
    </section>
    <section>
      <Output bind:title {md} />
    </section>
  </div>
{/await}
