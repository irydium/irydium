<script>
</script>

<style>
  .card {
	  background-clip: border-box;
	  background-color: #fff;
	  border: 1px solid rgba(0,0,0,0.125);
	  border-radius: .25rem;
	  display: -ms-flexbox;
	  display: flex;
	  -ms-flex-direction: column;
	  flex-direction: column;
	  min-width: 0;
	  position: relative;
	  word-wrap: break-word;
  }

  .card-header {
	  background-color: rgba(0,0,0,0.03);
	  border-bottom: 1px solid rgba(0,0,0,0.125);
	  margin-bottom: 0;
	  padding: .75rem 1.25rem;
  }

  .card-body {
	  -ms-flex: 1 1 auto;
	  flex: 1 1 auto;
	  min-height: 1px;
	  padding: 1.25rem;
  }

  .card-footer {
	  background-color: rgba(0,0,0,0.03);
	  border-top: 1px solid rgba(0,0,0,0.125);
	  padding: .75rem 1.25rem;
  }

</style>

<div>
  <div class="card">
    {#if $$slots.header}
    <div class="card-header">
      <slot name="header"></slot>
    </div>
    {/if}
    <div class="card-body">
      <slot name="body"></slot>
    </div>
    {#if $$slots.footer}
    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
    {/if}
  </div>
</div>
