<script>
  import { onMount } from "svelte";
  import CodeMirror from "./codemirror/CodeMirror.svelte";

  // need this level of indirection because plain reactive statements
  // will get triggered every time the *editor* updates, which we don't
  // want (leads to circular updates)
  export async function updateMd(new_code) {
    editor.set(new_code, "yaml-frontmatter");
  }

  onMount(() => {
    updateMd(md);
  });

  export let md = "";

  let editor;
</script>

<CodeMirror
  bind:this={editor}
  on:change={(event) => {
    md = event.detail.value;
  }}
/>
