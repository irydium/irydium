<script lang="ts">
  export let irmd = "";
  let srcdoc = "Loading...";

  async function compileIrmd(irmd: string) {
    if (process.browser) {
      srcdoc = await (
        await fetch("/compile/", {
          method: "POST",
          body: JSON.stringify({ irmd }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).text();
    }
  }

  $: irmd && compileIrmd(irmd);
</script>

<style>
  iframe {
    width: 100%;
    height: 100%;
  }
</style>

<iframe title="Rendered REPL" {srcdoc} />
