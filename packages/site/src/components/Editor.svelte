<script>
  import { onMount } from "svelte";
  import CodeMirror from "./codemirror/CodeMirror.svelte";

  onMount(() => {
    editor.set(md, "yaml-frontmatter");
  });

  export let md = "";

  let code;
  $: {
    code = md;
    editor && editor.update(md);
  }

  let editor;
</script>

<CodeMirror
  bind:this={editor}
  on:change={(event) => {
    code = event.detail.value;
  }} />
