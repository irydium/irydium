<script>
  export let type = "";
  let title = type[0].toUpperCase() + type.substr(1);
  let symbol;

  if (type === "note") symbol = "ℹ️";
  else if (type === "warning") symbol = "⚠️";
</script>

<style>
  .admonition {
    margin: 1.5625em auto;
    padding: 0 0.6rem 0.8rem !important;
    overflow: hidden;
    page-break-inside: avoid;
    border-left: 0.2rem solid;
    border-left-color: currentcolor;
    border-left-color: rgba(var(--pst-color-admonition-default), 1);
    border-bottom-color: rgba(var(--pst-color-admonition-default), 1);
    border-right-color: rgba(var(--pst-color-admonition-default), 1);
    border-top-color: rgba(var(--pst-color-admonition-default), 1);
    border-radius: 0.1rem;
    box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.05),
      0 0 0.05rem rgba(0, 0, 0, 0.1);
    transition: color 0.25s, background-color 0.25s, border-color 0.25s;
  }

  .admonition.note {
    /* border-left-color: var(--color-admonition-title--note); */
    border-left-color: #00b0ff;
  }

  .admonition.warning {
    /* border-left-color: var(--color-admonition-title--note); */
    border-left-color: #ff9100;
  }

  .admonition-title {
    position: relative;
    margin: 0 -0.75rem 0.5rem;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
    font-weight: 500;
  }

  .admonition-title.note {
    background-color: rgba(0, 176, 255, 0.1);
  }

  .admonition-title.warning {
    background-color: rgba(255, 145, 0, 0.1);
  }
</style>

<div class="admonition {type}">
  <p class="admonition-title {type}">{symbol ? symbol + ' ' : ''}{title}</p>
  <slot />
</div>
