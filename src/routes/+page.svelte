<script>
	import {
		MapLibre,
		GeoJSON,
		MarkerLayer,
		Popup,
		LineLayer,
	} from "svelte-maplibre";
	import Modal from "$lib/Modal.svelte";
	import Info from "$lib/Info.svelte";
	import Chapter from "../lib/Chapter.svelte";

	let showModal = false;

	/** @type {import('./$types').ActionData} */
	export let form;

	let center;

	$: if (form?.success) {
		center = form.center;
	}

</script>

<div class="grid grid-cols-2 h-[10vh]">
	<div class="h-[10vh] flex justify-center">
		<span class="m-auto text-xl font-bold"
			>Geography of the Internet <button
				class="align-middle pl-2"
				on:click={() => (showModal = true)}
			>
				<Info height={25} width={25} />
			</button>
		</span>
	</div>
	<div class="h-[10vh] flex justify-center">
		<form
			method="POST"
			class="m-auto flex gap-x-2 justify-center items-center"
		>
			<label class="label" for="url">
				<span class="label-text text-md mr-2 font-bold">URL:</span>
			</label>
			<input
				type="text"
				name="url"
				placeholder="Type here"
				class="input input-bordered w-full max-w-xs"
			/>
			<button class="btn">Create Story</button>
		</form>
	</div>

	<div />
</div>
<div class="w-full grid grid-cols-2 h-[90vh] overflow-hidden">
	<div class="overflow-scroll">
		<div class="ml-8 pr-4">
			<h2 class="text-lg font-bold pb-4">Introduction</h2>
			<p class="pb-3">The internet functions as a global network that links computers and devices, allowing them to communicate through standardized protocols. This extensive framework enables the global exchange and sharing of information, resources, and services. Users worldwide can connect, communicate, and access a broad spectrum of content, including websites, documents, images, videos, and more. In modern life, the internet has become integral, influencing how we communicate, work, learn, and entertain ourselves. Its transformative influence is apparent in its role in connecting people globally, establishing itself as a fundamental tool for disseminating information and fostering collaboration.</p>

			<p class="pb-3">When sending a request over the internet, it doesn't follow a direct path to the destination address. Instead data is dynamically routed through multiple servers. Despite its often-perceived virtual nature, the internet has a tangible reality, with everything existing on and passing through physical servers.</p>
				
			<p class="pb-3">The production and maintenance of servers involve the use of tangible resources like metals and water, and the creation of their technical hardware requires human labor. Once operational, servers demand a continuous power supply. The servers managing requests are often controlled by various organizations unrelated to the final destination.</p>

			<h3 class="font-bold pb-3">Disclaimer</h3>
			<p class="pb-3">This application incorporates server-side code, executed on a server before being transmitted to your browser. Unless you run the app locally, the server executing this code is situated somewhere globally, and the route's origin is not your current location. Moreover, certain servers limit inspection or have been combined due to identical locations.</p>
		    <h2 class="text-lg font-bold pb-3">Journey</h2>	
		</div>
		{#if form?.success == true && center}
		<div class="ml-8 pr-4">
		<p class="pb-3">The request to <strong>{form.destination_url}</strong> traversed a network of <strong class="text-lg">{form.hops}</strong> servers. The following list comprises traceable server locations along the path of the request.</p>
	</div>
		<div class="border-t">
			{#each form?.points.features as point,i}
				<Chapter
					number={point.properties.number.replace(/,\s*$/, "")}
					city={point.properties.city}
					country={point.properties.country}
					organization={point.properties.organization}
					isp={point.properties.isp}
					destination={i == form?.points.features.length - 1 ? true : false}
				/>
				
			{/each}
		</div>
		{:else if form?.error}
		<div class="ml-8 pr-4">
			<div role="alert" class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
				<span>Could not load journey: {form.error}</span>
			  </div>
			
		</div>
		{:else }
		<div class="ml-8 pr-4">
			<div role="alert" class="alert">
				<Info height={20} width={20} />
				<span>Enter a URL to get started</span>
			  </div>
		</div>
			
		{/if}
	</div>
	
	<div class="border">
		{#if form?.success == true && center}
			<MapLibre
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
				class="map border-2"
				standardControls
				{center}
				zoom={3}
				hash
			>
				<GeoJSON id="points" data={form.points} promoteId="promoteId" 
				cluster={{
				  radius: 300,
				  maxZoom: 14,
				  properties: {
					// Sum the `mag` property from all the points in each cluster.
					number: ["concat", ['get', "number"]],
				},
				}}>
					<MarkerLayer let:feature >
						<div class="bg-gray-200 rounded-full py-1 px-3 shadow">
							<div class="text-sm font-bold">
								{feature.properties.number.replace(/,\s*$/, "")}
							</div>
						</div>
						<Popup openOn="hover">
							{feature.properties.city}
						</Popup>
					</MarkerLayer>
				</GeoJSON>
				<GeoJSON id="line" data={form.line}>
					<LineLayer
						layout={{ "line-cap": "round", "line-join": "round" }}
						paint={{
							"line-width": 2.5,
							"line-color": "#FF0000",
							"line-opacity": 0.6,
						}}
					/>
				</GeoJSON>
			</MapLibre>
		{:else}
			<MapLibre
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
				class="map"
				standardControls
				center={[0, 0]}
				zoom={1}
				hash
			/>
		{/if}
	</div>
</div>
<Modal bind:showModal>
	<h2 class="text-xl pb-4 font-bold">What is this app about?</h2>
	<p class="pb-2">This application was developed as part of the "Data and Society" course at UBC. The assignment required the creation of a nonlinear, geographic narrative that illustrates the various resource involved in the development or maintenance of a piece technology used in everyday life. </p>

	<p class="pb-2">I chose to create  dynamic story that, given an internet address, visualizes the route a request takes to reach a server. To retrieve the ips of the servers a request goes through, I utilized the <a class="link" href="https://en.wikipedia.org/wiki/Traceroute">traceroute</a> program. The location and addtional information of servers is retrieved using the <a class="link" href="https://ip-api.com/">ip-api.com</a>.</p>
	<p class="pb-2">
		Find the source code of the app <a  class="link" href="https://github.com/jstet/geography_of_technology-">here</a>.
	</p>

</Modal>

<style>
	:global(.map) {
		height: 90vh;
		width: 50vw;
	}
</style>
