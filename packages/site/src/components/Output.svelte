<script lang="ts">
  export let md = "";
  let srcdoc = "Loading...";

  async function compileIrmd(irmd: string) {
    if (process.browser) {
      srcdoc = await (
        await fetch("/compile/", {
          method: "POST",
          body: JSON.stringify({ md }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).text();
    }
  }
  $: md && compileIrmd(md);
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
