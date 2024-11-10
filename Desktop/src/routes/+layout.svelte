<script lang="ts">
	import { BarsOutline } from 'flowbite-svelte-icons';
	import '../app.css';
	// import { AppStates } from '$lib';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data, children } = $props();
	let prevState = '/';
</script>

<div class="flex h-screen w-screen flex-col bg-slate-50">
	<div class="fixed z-50 h-8 w-full" data-tauri-drag-region>
		<button
			class="float-right m-1 mr-2"
			onclick={() => {
				if ($page.url.pathname === '/settings') {
					goto(prevState);
				} else {
					prevState = $page.url.pathname;
					goto('/settings');
				}
			}}
		>
			<BarsOutline />
		</button>
	</div>
	{@render children()}
</div>
