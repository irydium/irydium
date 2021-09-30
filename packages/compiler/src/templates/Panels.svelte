 <script>
 </script>

<style>
  .container {
	  margin-left: auto;
	  margin-right: auto;
	  padding-left: 15px;
	  padding-right: 15px;
	  width: 100%;
  }
  .row {
	  display: -ms-flexbox;
	  display: flex;
	  -ms-flex-wrap: wrap;
	  flex-wrap: wrap;
	  margin-left: -15px;
	  margin-right: -15px;
  }

</style>

<div class="container">
  <div class="row">
    <slot></slot>
  </div>
</div>
