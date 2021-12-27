<script>
  export let panelStyle = ''; // blank string as default
</script>

<div class={"container " + panelStyle}>
  <div class="row">
    <slot />
  </div>
</div>
