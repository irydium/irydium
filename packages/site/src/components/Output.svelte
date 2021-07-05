<script lang="ts">
  import { throttle } from "lodash";
  import { compile } from "../../../compiler/src/compile.js";

  export let md = "";
  export let title = "Untitled Document";
  let srcdoc = "Loading...";

  const updateDoc = throttle((md) => {
    compile(md).then((output) => {
      srcdoc = output.html;
      title = output.frontMatter.title || "Untitled Document";
    });
  }, 500);

  $: {
    updateDoc(md);
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
