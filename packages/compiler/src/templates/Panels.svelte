<script>
  export let style = ''; // blank string as default
</script>

<div class={"container " + style}>
  <div class="row">
    <slot />
  </div>
</div>
