<script>
export let city;
export let country;
export let organization;
export let number;
export let isp;
export let destination;

</script>

<div class="bg-base-100  border-b">
    <div class="p-6">
      <h2 class="text-lg pb-3 font-semi-bold"><span class="bg-gray-200 rounded-full py-1 px-3 shadow">{number}</span> - {city}, {country}</h2>
      <p class="pl-1">
      {#if number == 1}
      The journey of the requests begins with the ISP of the server of this app: <span class="badge badge-info badge-md">{isp}</span>
      {:else if destination}
      The organization of the last tracable server your request went through: <span class="badge badge-success badge-md">{isp}</span>
      {:else}
      Organization: <span class="badge badge-neutral badge-md">{organization}</span>
     {/if}    
    </p>
    </div>
  </div>