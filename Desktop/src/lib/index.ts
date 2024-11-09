// place files you want to import through the `$lib` alias in this folder.

export function toLocalTime(time: string) {
	let date = new Date(time);
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
	return date.toISOString().slice(0, 16);
}

export const AppStates = {
	AskingForAPIKey: -1,
	Initializing: 0,
	NoScreenshot: 1,
	TakingScreenshot: 2,
	Processing: 3,
	showResult: 4,
	error: 5
};
