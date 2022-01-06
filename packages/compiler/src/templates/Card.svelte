<script>
  export let style = {};
  
</script>

<div class={style.column}>
  <div class={"card " + style.card}>
    {#if $$slots.header}
      <div class={"card-header " + style.header}>
        <slot name="header" />
      </div>
    {/if}
    <div class={"card-body " + style.body}>
      <slot name="body" />
    </div>
    {#if $$slots.footer}
      <div class={"card-footer " + style.footer}>
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>
