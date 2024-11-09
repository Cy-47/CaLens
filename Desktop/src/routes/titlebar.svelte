<div class="fixed z-50 h-8 w-full" data-tauri-drag-region>
	<button
		class="float-right m-1 mr-2"
		on:click={() => {
			if ($appState == AppStates.AskingForAPIKey) {
				$appState = prevState;
			} else {
				prevState = $appState;
				$appState = AppStates.AskingForAPIKey;
			}
		}}
	>
		<BarsOutline />
	</button>
</div>
