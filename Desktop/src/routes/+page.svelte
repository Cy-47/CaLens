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
	import {} from '@tauri-apps/api';
	import * as fs from '@tauri-apps/plugin-fs';
	const debug = false;
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

	const AppStates = {
		AskingForAPIKey: -1,
		Initializing: 0,
		NoScreenshot: 1,
		TakingScreenshot: 2,
		Processing: 3,
		showResult: 4,
		error: 5
	};

	let imagePath = 'screenshot.png';
	let shortCut = 'CommandOrControl+Shift+C';
	let log = $state('');
	let preprocessor: Preprocessor;
	let appCacheDirPath;
	let screenshotDirPath: string;
	let appConfigDirPath: string;
	let config: object;
	let appState = $state(AppStates.Initializing);
	let apiKey = $state('');
	let prevState = AppStates.AskingForAPIKey;
	let assetUrl = $state('');
	let errorMsg = $state('');

	async function checkScreenRecordingPermission() {
		try {
			// Attempt to capture the screen
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true
			});

			// If successful, stop the stream immediately
			const tracks = stream.getTracks();
			tracks.forEach((track) => track.stop());
			console.log('Permission is granted');

			// Permission is granted
			return true;
		} catch (error) {
			// Permission is denied or an error occurred
			console.error('Permission is denied');
			return false;
		}
	}

	let initialized: Promise<void> = init();
	async function init() {
		checkScreenRecordingPermission();
		// Try to read config file
		appConfigDirPath = await path.appConfigDir();
		let configFile = await path.join(appConfigDirPath, 'config.json');
		// Create or read
		if (!(await fs.exists(configFile))) {
			config = {};
			await fs.mkdir(appConfigDirPath, { recursive: true });
			await fs.create(configFile);
			await fs.writeTextFile(configFile, JSON.stringify(config));
		} else {
			config = JSON.parse(await fs.readTextFile(configFile));
		}
		// Check if API key is set
		if (!config.apiKey) {
			appState = AppStates.AskingForAPIKey;
			return;
		}
		apiKey = config.apiKey;
		await initWithAPIKey();
	}

	async function initWithAPIKey() {
		// Create a directory to store screenshots
		appCacheDirPath = await path.appCacheDir();
		screenshotDirPath = await path.join(appCacheDirPath, 'screenshots');
		imagePath = await path.join(screenshotDirPath, 'screenshot.png');
		assetUrl = convertFileSrc(imagePath) + '?t=';
		try {
			preprocessor = new Preprocessor(apiKey);
		} catch (error) {
			errorMsg = error.message;
			appState = AppStates.error;
		}

		// Support hot reloading in development
		if (await isRegistered(shortCut)) {
			unregister(shortCut);
		}
		register(shortCut, (event) => {
			if (event.state === 'Pressed') captureAndExtract();
		});
		appState = AppStates.NoScreenshot;
		// appState = AppStates.showResult;
	}

	async function setConfig(key: string, value: any) {
		config[key] = value;
		await fs.writeTextFile(
			await path.join(appConfigDirPath, 'config.json'),
			JSON.stringify(config)
		);
	}

	async function submitAPIKey() {
		await setConfig('apiKey', apiKey);
		await initWithAPIKey();
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
		console.log('Screenshot taken');
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

		log += event;
		appState = AppStates.showResult;
		console.log(event);
		// await open(links[0].link);
		setTimeout(() => {
			appWindow.setFocus();
		}, 1000);
	}
</script>

<!-- <DateInput bind:value={date} timePrecision="minute" /> -->
<div class="flex h-screen w-screen flex-col bg-slate-50">
	<div class="fixed z-50 h-8 w-full" data-tauri-drag-region>
		<button
			class="float-right m-1 mr-2"
			onclick={() => {
				if (appState == AppStates.AskingForAPIKey) {
					appState = prevState;
				} else {
					prevState = appState;
					appState = AppStates.AskingForAPIKey;
				}
			}}
		>
			<BarsOutline />
		</button>
	</div>
	<div class="data-tauri-drag-region data-tauri-drag-region mt-8 flex min-h-0 shrink grow">
		{#if appState == AppStates.Initializing}
			<div
				data-tauri-drag-region
				class="flex grow flex-col items-center justify-center text-xl text-gray-700"
			>
				<p>Initializing</p>
			</div>
		{:else if appState == AppStates.AskingForAPIKey}
			<div
				data-tauri-drag-region
				class="flex grow flex-col items-center justify-center text-xl text-gray-700"
			>
				<p>Please enter your OpenAI API key</p>
				<div class="mt-4">
					<input type="text" bind:value={apiKey} class="mr-2" placeholder="sk-..." />
					<Button on:click={submitAPIKey}>Submit</Button>
				</div>
			</div>
		{:else if appState == AppStates.NoScreenshot}
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
				<div
					data-tauri-drag-region
					class="m-4 mt-1 flex min-h-0 flex-1 items-center justify-center"
				>
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
								class="w-11/12"
							/>
						</span>
						<span class="w-auto p-0.5">
							<input type="datetime-local" class="text-xs" bind:value={event['start']} /> -
							<input type="datetime-local" class="text-xs" bind:value={event['end']} />
						</span>
						<Checkbox bind:checked={event['allDay']}>All Day</Checkbox>
						<span class="w-auto p-0.5">
							<Label>Description</Label>
							<Textarea bind:value={event['description']} rows={3} />
						</span>
						{#each eventKeys as key}
							{#if !['title', 'allDay', 'start', 'end', 'description'].includes(key)}
								<span class="w-auto p-0.5">
									{key}: <input type="text" bind:value={event[key]} placeholder={key} />
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
</div>

<style>
	input {
		border: none;
		border-bottom: 1px solid #ccc;
		padding: 2px;
	}
	input:focus {
		box-shadow: none;
	}
</style>
