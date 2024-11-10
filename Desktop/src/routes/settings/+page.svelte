<script lang="ts">
	import Config from '$lib/config';
	import { onMount } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import { isRegistered, unregister } from '@tauri-apps/plugin-global-shortcut';

	let { data } = $props();
	let config = data.config;
	let apiKey = $state(config.apiKey);

	onMount(async () => {
		const registered = await isRegistered(config.shortCut);
		if (registered) {
			await unregister(config.shortCut);
		}
		apiKey = config.apiKey;
	});

	// Function to update the config with the API key
	function submitAPIKey() {
		config.apiKey = apiKey;
	}
</script>

<div
	data-tauri-drag-region
	class="flex grow flex-col items-center justify-center text-xl text-gray-700"
>
	<p>Please enter your OpenAI API key</p>
	<div class="mt-4">
		<input type="text" bind:value={apiKey} class="border-b-only mr-2" placeholder="sk-..." />
		<Button on:click={submitAPIKey}>Submit</Button>
	</div>
</div>
