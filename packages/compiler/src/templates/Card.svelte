<script>
  // Note: These have to be explicit props as mustache.render cannot pass an object to Svelte
  export let columnStyle = ''; // blank string as default
  export let headerStyle = '';
  export let bodyStyle = '';
  export let footerStyle = '';
  export let cardStyle = '';
</script>

<div class={columnStyle}>
  <div class={cardStyle}>
    {#if $$slots.header}
      <div class={headerStyle}>
        <slot name="header" />
      </div>
    {/if}
    <div class={bodyStyle}>
      <slot name="body" />
    </div>
    {#if $$slots.footer}
      <div class={footerStyle}>
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>
