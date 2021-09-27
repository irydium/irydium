<script>
  import { onMount, afterUpdate } from 'svelte';
  const contents = ["test", "test2"];
  export let cards=[];

  onMount(async () => {
    console.log(cards);
  });

  afterUpdate(async () => {
    console.log(cards);
  });

</script>

<style>
</style>

<div class="container">
  <div class="row">
    <slot></slot>
  </div>
</div>
