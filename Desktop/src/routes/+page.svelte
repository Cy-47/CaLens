<script lang="ts">
	import { register, isRegistered, unregister } from '@tauri-apps/plugin-global-shortcut';
	import { Command, open } from '@tauri-apps/plugin-shell';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import * as path from '@tauri-apps/api/path';
	import { Preprocessor } from '../../../Core/index';
	import { create, readFile } from '@tauri-apps/plugin-fs';
	import { google, outlook, office365, yahoo, ics, type CalendarEvent } from 'calendar-link';
	import { Checkbox, Textarea, DarkMode, Label, Button, Input } from 'flowbite-svelte';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import { convertFileSrc } from '@tauri-apps/api/core';
	// import { DateInput } from 'date-picker-svelte';
	import { toLocalTime, AppStates } from '$lib/index';
	import Config from '$lib/config';
	import * as fs from '@tauri-apps/plugin-fs';
	import { goto } from '$app/navigation';
	import '../app.css';
	const debug = true;
	const appWindow = getCurrentWebviewWindow();

	// Set event as an object
	let event = $state<CalendarEvent>({
		allDay: false,
		description:
			'Exam 2 for the course MATH-225 covering topics in Linear Algebra and Linear Differential Equations.',
		end: '2024-11-08T13:50:00',
		location: '',
		start: '2024-11-08T13:00:00',
		title: 'MATH-225 Exam 2'
	});
	let eventKeys = $derived(Object.keys(event));
	let links = $derived([
		{ name: 'Google', link: google(event) },
		{ name: 'Outlook', link: outlook(event) },
		{ name: 'Office', link: office365(event) },
		{ name: 'Yahoo', link: yahoo(event) },
		{ name: 'ICS', link: ics(event) }
	]);

	let imagePath = 'screenshot.png';
	let log = $state('');
	let preprocessor: Preprocessor;
	let appCacheDirPath;
	let screenshotDirPath: string;
	let appConfigDirPath: string;
	let appState = $state(AppStates.Initializing);
	let apiKey = $state('');
	let assetUrl = $state('');
	let errorMsg = $state('');
	let config: Config;

	$inspect('appState', appState);

	let initialized: Promise<void> = init();
	async function init() {
		config = await Config.getInstance();
		console.log('Loaded config', config);

		// Create a directory to store screenshots
		appCacheDirPath = await path.appCacheDir();
		screenshotDirPath = await path.join(appCacheDirPath, 'screenshots');
		imagePath = await path.join(screenshotDirPath, 'screenshot.png');
		assetUrl = convertFileSrc(imagePath) + '?t=';
		// Test screenshot permission
		Command.create('screencapture', ['-x', imagePath])
			.execute()
			.then((output) => {
				console.log('Test screenshot', output);
			});
		console.log('AAAA', config, config.apiKey);
		// Check if API key is set
		if (config.apiKey) {
			apiKey = config.apiKey;
			console.log('init with API key', apiKey);
			await initWithAPIKey();
		} else {
			// goto('/settings');
		}
	}

	async function initWithAPIKey() {
		try {
			preprocessor = new Preprocessor(apiKey);
		} catch (error) {
			errorMsg = error.message;
			appState = AppStates.error;
		}

		// Support hot reloading in development
		if (await isRegistered(config.shortCut)) {
			unregister(config.shortCut);
		}
		register(config.shortCut, (event) => {
			if (event.state === 'Pressed') captureAndExtract();
		});
		appState = AppStates.NoScreenshot;
		// appState = AppStates.showResult;
	}

	async function captureAndExtract() {
		appState = AppStates.TakingScreenshot;
		if (!(await fs.exists(screenshotDirPath)))
			await fs.mkdir(screenshotDirPath, { recursive: true });
		if (await fs.exists(imagePath)) await fs.remove(imagePath);
		log += 'Taking screenshot...\n';
		console.log('Taking screenshot...');
		await initialized;
		const command = Command.create('screencapture', ['-i', imagePath]);
		// doesn't work
		// command.on('error', (error) => {
		// 	text += 'Screenshot failed, probably cancelled by user';
		// 	text += error;
		// 	console.error(error);
		// 	return;
		// });
		const output = await command.execute();
		console.log(output);
		if (!(await fs.exists(imagePath))) {
			log += 'Screenshot failed, probably cancelled by user\n';
			appState = AppStates.NoScreenshot;
			return;
		}
		assetUrl;
		log += `Screenshot saved to ${imagePath}`;
		appState = AppStates.Processing;
		appWindow.setFocus();
		if (debug) await new Promise((r) => setTimeout(r, 1000));
		let img: Uint8Array = await readFile(imagePath);

		try {
			if (!debug || false) {
				event = await preprocessor.extractEvent(img);
			}
		} catch (error) {
			errorMsg = error.message;
			appState = AppStates.error;
			return;
		}
		event.start = toLocalTime(event.start);
		event.end = toLocalTime(event.end);

		log += event;
		appState = AppStates.showResult;
		console.log('Parsed event', event);
		// await open(links[0].link);
		setTimeout(() => {
			appWindow.setFocus();
		}, 1000);
	}
</script>

<!-- <DateInput bind:value={date} timePrecision="minute" /> -->

<div class="data-tauri-drag-region data-tauri-drag-region mt-8 flex min-h-0 shrink grow">
	{#if appState == AppStates.Initializing}
		<div
			data-tauri-drag-region
			class="flex grow flex-col items-center justify-center text-xl text-gray-700"
		>
			<p>Initializing</p>
		</div>
	{:else if appState == AppStates.AskingForAPIKey}{:else if appState == AppStates.NoScreenshot}
		<div
			data-tauri-drag-region
			class="flex grow flex-col items-center justify-center text-xl text-gray-700"
		>
			<p>Snip an event with</p>
			<p>Command+Shift+C!</p>
			<p class="text-l text-gray-500">Cancel by ESC</p>
		</div>
	{:else if appState == AppStates.TakingScreenshot}
		<div
			data-tauri-drag-region
			class="flex grow flex-col items-center justify-center text-xl text-gray-700"
		>
			<p>Taking Screenshot...</p>
			<p>Cancel by ESC</p>
		</div>
	{:else if appState == AppStates.Processing}
		<div
			data-tauri-drag-region
			class="data-tauri-drag-region flex h-full w-full grow flex-col items-center justify-center text-xl text-gray-700"
		>
			<div
				data-tauri-drag-region
				class="m-4 mt-1 flex max-h-[50%] min-h-0 flex-1 items-center justify-center"
			>
				<div class="h-fit min-h-0 w-fit min-w-0">
					<img
						src={assetUrl + Date.now()}
						alt="Screenshot"
						class="mx-auto max-h-full object-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
					/>
				</div>
			</div>
			<p>Processing</p>
		</div>
	{:else if appState == AppStates.showResult}
		<div data-tauri-drag-region class="flex min-h-0 flex-1 flex-row">
			<div data-tauri-drag-region class="m-4 mt-1 flex min-h-0 flex-1 items-center justify-center">
				<div class="h-fit min-h-0 w-fit">
					<img
						src={assetUrl + Date.now()}
						alt="Screenshot"
						class="mx-auto max-h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
					/>
				</div>
			</div>
			<div
				data-tauri-drag-region
				class="flex w-96 flex-col gap-y-4 rounded-tl-lg bg-white px-6 py-6 text-sm"
			>
				<div class="flex flex-col justify-center gap-y-2">
					<span class="h1 display-block w-auto p-0.5 font-bold">
						<input
							type="text"
							bind:value={event['title']}
							placeholder={'Title'}
							class="border-b-only w-11/12"
						/>
					</span>
					<span class="w-auto p-0.5">
						<input
							type="datetime-local"
							class="border-b-only text-xs"
							bind:value={event['start']}
						/>
						-
						<input type="datetime-local" class="border-b-only text-xs" bind:value={event['end']} />
					</span>
					<Checkbox bind:checked={event['allDay']}>All Day</Checkbox>
					<span class="w-auto p-0.5">
						<Label>Description</Label>
						<Textarea bind:value={event['description']} rows={3} />
					</span>
					{#each eventKeys as key}
						{#if !['title', 'allDay', 'start', 'end', 'description'].includes(key)}
							<span class="w-auto p-0.5">
								{key}:
								<input
									type="text"
									bind:value={event[key]}
									placeholder={key}
									class="border-b-only"
								/>
							</span>
						{/if}
					{/each}
				</div>
				<div class="flex flex-row justify-around">
					{#each links as link}
						<a href={link.link} target="_blank">
							<div class=" h-10 w-14 rounded-sm bg-slate-200 text-center text-xs leading-10">
								{link.name}
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	{:else if appState == AppStates.error}
		<div
			class="flex grow flex-col items-center justify-center gap-1 text-center text-xl text-red-600"
		>
			<p>Error</p>
			<p class="inline-block text-sm">{errorMsg}</p>
		</div>
	{/if}
	<!-- <span style="white-space: pre-line">{log}</span> -->
</div>
