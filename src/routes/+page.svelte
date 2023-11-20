<script>


/** @type {import('./$types').ActionData} */
export let form;
$: console.log(form)
  
</script>


<form method="POST">
	<label>
		URL
		<input name="url" >
	</label>
	<button>Create Story</button>
</form>
