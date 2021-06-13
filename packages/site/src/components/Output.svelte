<script lang="ts">
  import { compile } from "../../../compiler/src/compile.js";

  export let md = "";
  let srcdoc = "Loading...";

  $: {
    compile(md).then((html) => (srcdoc = html));
  }
</script>

<style>
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    border-left: 1px #000;
  }
</style>

<iframe title="Rendered REPL" {srcdoc} />
