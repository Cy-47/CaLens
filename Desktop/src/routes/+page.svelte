<script lang="ts">
	import { register, isRegistered, unregister } from '@tauri-apps/plugin-global-shortcut';
	import { Command, open } from '@tauri-apps/plugin-shell';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import * as path from '@tauri-apps/api/path';
	import { ExtractionPipeline } from '../../../Core/index';
	import { readFile } from '@tauri-apps/plugin-fs';
	import { google, outlook, office365, yahoo, ics, type CalendarEvent } from 'calendar-link';
	import { Checkbox, Textarea, DarkMode, Label, Button, Input } from 'flowbite-svelte';
	import { convertFileSrc } from '@tauri-apps/api/core';
	// import { DateInput } from 'date-picker-svelte';
	import { toLocalTime, AppStates } from '$lib/index';
	import * as fs from '@tauri-apps/plugin-fs';
	// import { goto } from '$app/navigation';
	import { type eventsType } from '../../../Core/event';
	import '../app.css';

	const debug = false;

	const appWindow = getCurrentWebviewWindow();
	let { data } = $props();
	let config = data.config;

	// Initialize sample event
	let events = $state<eventsType>([
		{
			title: 'MATH-225 Exam 2',
			allDay: false,
			description:
				'Exam 2 for the course MATH-225 covering topics in Linear Algebra and Linear Differential Equations.',
			end: '2024-11-08T13:50:00',
			location: '',
			start: '2024-11-08T13:00:00'
		},
		{
			title: 'Placeholder event 2',
			allDay: false,
			description: 'Hi, I am a placeholder event!',
			end: '2024-11-08T13:50:00',
			location: '',
			start: '2024-11-08T13:00:00'
		}
	]);
	let linkss = $derived(
		events.map((event) => ({
			//   eventId: event.id,
			links: [
				{ name: 'Google', link: google(event) },
				{ name: 'Outlook', link: outlook(event) },
				{ name: 'Office', link: office365(event) },
				{ name: 'Yahoo', link: yahoo(event) },
				{ name: 'ICS', link: ics(event) }
			]
		}))
	);
	$inspect('events', events);
	$inspect('links', linkss);

	let imagePath = 'screenshot.png';
	let log = $state('');
	let pipeline: ExtractionPipeline;
	let appCacheDirPath;
	let screenshotDirPath: string;
	let appState = $state(AppStates.Initializing);
	let assetUrl = $state('');
	let errorMsg = $state('');

	$inspect('appState', appState);

	let initialized: Promise<void> = init();
	async function init() {
		appCacheDirPath = await path.appCacheDir();
		screenshotDirPath = await path.join(appCacheDirPath, 'screenshots');
		imagePath = await path.join(screenshotDirPath, 'screenshot.png');
		assetUrl = convertFileSrc(imagePath) + '?t=';

		Command.create('screencapture', ['-x', imagePath])
			.execute()
			.then((output) => {
				console.log('Test screenshot', output);
			});

		if (config.apiKey) {
			console.log('init with API key', config.apiKey);
			await initWithAPIKey();
		} else {
			// goto('/settings');
		}
	}

	async function initWithAPIKey() {
		try {
			pipeline = new ExtractionPipeline(config.apiKey);
		} catch (error) {
			errorMsg = (error as Error).message;
			appState = AppStates.error;
		}

		if (await isRegistered(config.shortCut)) {
			unregister(config.shortCut);
		}
		register(config.shortCut, (event) => {
			if (event.state === 'Pressed') captureAndExtract();
		});
		appState = AppStates.NoScreenshot;
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
				const temp: eventsType = await pipeline.processImage(img);
				temp.forEach((event) => {
					event.start = toLocalTime(event.start);
					event.end = toLocalTime(event.end);
				});
				events = temp;
			}
		} catch (error) {
			errorMsg = (error as Error).message;
			appState = AppStates.error;
			return;
		}

		appState = AppStates.showResult;
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
				class="flex w-96 flex-col gap-y-4 overflow-y-scroll rounded-tl-lg bg-white px-2 py-6 text-sm"
			>
				{#each events as event, i}
					<div class="pl-4 pr-2">
						<div class="flex flex-col justify-center gap-y-2">
							<span class="w-auto p-0.5 text-lg font-bold">
								<!-- {i + 1}. -->
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
								<input
									type="datetime-local"
									class="border-b-only text-xs"
									bind:value={event['end']}
								/>
							</span>
							<Checkbox bind:checked={event['allDay']}>All Day</Checkbox>
							<span class="w-auto">
								<Label>Description</Label>
								<textarea
									bind:value={event['description']}
									class="w-full resize-y rounded-md border border-gray-300 p-1.5 text-xs"
								></textarea>
							</span>
							<!-- other keys -->
							<!-- {#each eventKeys as key}
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
					{/each} -->
							<div class="flex flex-row justify-around">
								{#each linkss[i].links as { link, name }}
									<a href={link} target="_blank">
										<div class=" h-8 w-14 rounded-sm bg-slate-200 text-center text-xs leading-8">
											{name}
										</div>
									</a>
								{/each}
							</div>
						</div>
					</div>
					<!-- if not last event -->
					{#if i < events.length - 1}
						<div class="mt-2 w-full border-b border-gray-400"></div>
					{/if}
				{/each}
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
</div>
