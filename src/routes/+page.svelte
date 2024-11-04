<script>
	import { register } from '@tauri-apps/api/globalShortcut';
	import { Command } from '@tauri-apps/api/shell';
	import { appWindow } from '@tauri-apps/api/window';

	console.log('Registering shortcut');

	register('CommandOrControl+Shift+C', async () => {
		console.log('Shortcut triggered');
		await new Command('screencapture', ['-i', '-c']).execute();
		console.log('Screenshot taken');
		appWindow.setFocus();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
