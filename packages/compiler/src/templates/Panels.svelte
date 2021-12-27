<script>
  export let panelStyle = ''; // blank string as default
  let fullStyle = "container " + panelStyle
</script>

<div class={fullStyle}>
  <div class="row">
    <slot />
  </div>
</div>
