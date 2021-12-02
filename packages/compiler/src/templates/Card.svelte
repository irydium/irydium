<div class="d-flex col-lg-6 col-md-6 col-sm-6 col-xs-12 p-2">
  <div class="card w-100">
    {#if $$slots.header}
      <div class="card-header">
        <slot name="header" />
      </div>
    {/if}
    <div class="card-body">
      <slot name="body" />
    </div>

    {#if $$slots.footer}
      <div class="card-footer">
        <slot name="footer" />
      </div>
    {/if}
  </div>
</div>
