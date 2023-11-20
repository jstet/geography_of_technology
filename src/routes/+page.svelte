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
{#if form?.error}
	<p>{form.error}</p>
{/if}
{#if form?.success == true}
	{#each form.output.hops as hop}
		<p>{hop.geolocation.city}</p>
	{/each}
{/if}
