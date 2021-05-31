<script>
  import { onMount } from "svelte";
  import CodeMirror from "./codemirror/CodeMirror.svelte";

  onMount(() => {
    editor.set(md, "yaml-frontmatter");
  });

  export let md = "";

  let editor;
</script>

<CodeMirror
  bind:this={editor}
  on:change={(event) => {
    md = event.detail.value;
  }} />
