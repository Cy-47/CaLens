<script lang="ts">
	import { BarsOutline } from 'flowbite-svelte-icons';
	import { DarkMode } from 'flowbite-svelte';
	import '../app.css';
	import Config from '$lib/config';
	// import { AppStates } from '$lib';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { states } from './shared.svelte';

	let { data, children } = $props();
	console.log(page, $page);
	if (Config.isFirstTime()) {
		goto('/settings');
	}

	function toggleSettings() {
		console.log('toggleSettings', $page.route.id, states.prevPage);
		if ($page.route.id === '/settings') {
			goto(states.prevPage);
		} else {
			states.prevPage = $page.route.id as string;
			goto('/settings');
		}
	}
</script>

<div class=" flex h-screen w-screen flex-col">
	<div class=" z-50 w-full" data-tauri-drag-region>
		<div class="float-right m-1 mr-2">
			<DarkMode class="p-1" />
			<button onclick={toggleSettings}>
				<BarsOutline class="dark:text-white" />
			</button>
		</div>
	</div>
	{@render children()}
</div>
