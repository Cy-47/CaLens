export const prerender = true;
export const ssr = false;
import Config from '$lib/config';

export async function load() {
	return { config: await Config.getInstance() };
}
