<script>
  import { onMount } from "svelte";

  import Editor from "../components/Editor.svelte";
  import Output from "../components/Output.svelte";

  export let segment = "";
  export let documents = [];
  let editor;

  const getFragment = () =>
    typeof window !== "undefined" && window.location.hash.slice(1);

  let selectedId = getFragment() || documents[0].id;
  let selectedExample;
  let md;

  $: {
    if (!selectedExample || selectedExample.id !== selectedId) {
      selectedExample =
        documents.find(({ id }) => id === selectedId) || documents[0];
      md = selectedExample.content;
      editor && editor.updateMd(md); // pass through updated state to codemirror
    }
  }

  onMount(() => {
    // shamelessly stolen from: https://github.com/sveltejs/svelte/blob/18780fac00ea21d7a21fbf815ffd0cd5048e5185/site/src/routes/examples/index.svelte#L76
    const onhashchange = () => {
      selectedId = getFragment();
    };
    window.addEventListener("hashchange", onhashchange, false);

    return () => {
      window.removeEventListener("hashchange", onhashchange, false);
    };
  });
</script>

<div class="body">
  <section class="document-list">
    <ul>
      {#each documents as document}
        <li>
          <a
            aria-current={document.id === selectedId ? "document" : undefined}
            href={`/${segment}#${document.id}`}>{document.title}</a
          >
        </li>
      {/each}
    </ul>
  </section>
  <section>
    <Editor bind:this={editor} bind:md />
  </section>
  <section>
    <Output {md} />
  </section>
</div>

<style>
  .body {
    position: relative;
    display: grid;
    grid-template-columns: 200px repeat(2, 1fr);
    grid-template-rows: 100% auto;
    gap: 0px;
    width: 100%;
    height: 100%;
  }

  section {
    height: calc(100vh - var(--nav-h));
  }

  .document-list ul {
    list-style: none;
    list-style-type: none;
    padding: 0;
  }

  .document-list li {
    padding: 8px 8px 8px 16px;
  }

  .document-list a {
    text-decoration: none;
    cursor: pointer;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 2px;
    background-color: rgb(255, 62, 0);
    display: block;
    bottom: -1px;
  }
</style>
