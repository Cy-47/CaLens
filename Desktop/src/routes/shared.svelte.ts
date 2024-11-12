import { AppStates } from '$lib';

export const states = $state({
	appState: AppStates.Initializing,
	prevPage: '/'
});
