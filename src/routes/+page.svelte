<script>
	import { MapLibre, GeoJSON, MarkerLayer, Popup } from 'svelte-maplibre';

	/** @type {import('./$types').ActionData} */
	export let form;

	let center;

	$: if (form?.success) {
		center = form.center
	}
	
</script>

<form method="POST" class="flex gap-x-2 justify-center items-center" style="height: 10vh;">
	<label class="label" for="url">
		<span class="label-text text-md mr-2 font-bold">URL:</span>
	</label>
	<input type="text" name="url" placeholder="Type here" class="input input-bordered w-full max-w-xs" />
	<button class="btn">Create Story</button>
</form>
<div>
	{#if form?.error}
	<p>{form.error}</p>
{/if}
{#if form?.success == true && center}
<MapLibre
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  class="map"
  standardControls
  center={center}
  zoom={3}
  hash
>
<GeoJSON id="states" data={form.points} >
	<MarkerLayer interactive let:feature>
		<div class="bg-gray-200 rounded-full p-2 shadow">
			<div class="text-sm font-bold">{feature.properties.number}</div>
		  </div>
		<Popup openOn="hover">
		  {feature.properties.city}
		</Popup>
	  </MarkerLayer>
</GeoJSON>
</MapLibre>
{/if}
</div>

<style>
  :global(.map) {
    height: 90vh;
  }
</style>
