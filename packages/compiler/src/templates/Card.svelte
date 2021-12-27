<script>
  export let cardStyle = ''; // blank string as default
  export let headerStyle = ''
  export let bodyStyle = ''
  export let footerStyle = ''
  let fullStyle = "d-flex col-lg-6 col-md-6 col-sm-6 col-xs-12 p-2 " + cardStyle
</script>

<div class={fullStyle}>
  <div class="card w-100">
    {#if $$slots.header}
      <div class={"card-header " + headerStyle}>
        <slot name="header" />
      </div>
    {/if}
    <div class={"card-body " + bodyStyle}>
      <slot name="body" />
    </div>

    {#if $$slots.footer}
      <div class={"card-footer " + footerStyle}>
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>
