// $lib/config.ts
import { path } from '@tauri-apps/api';
import * as fs from '@tauri-apps/plugin-fs';

/**
 * Singleton class to manage application configuration.
 */
class Config {
	private static instance: Config;
	[key: string]: any;
	[key: symbol]: any;
	private static proxyInstance: Config;

	// Define all config items here
	public apiKey: string;
	public shortCut: string;
	// Add future config items below

	private constructor() {
		this.apiKey = 'defaultApiKey';
		this.shortCut = 'CommandOrControl+Shift+C';
		// Initialize future config items here
	}

	/**
	 * Returns the singleton instance of the Config class.
	 * @returns {Promise<Config>} The singleton instance.
	 */
	public static async getInstance(): Promise<Config> {
		if (!Config.instance) {
			Config.instance = new Config();
			await Config.instance.loadConfig();
			Config.proxyInstance = new Proxy(Config.instance, {
				set(target, property, value) {
					if (property in target) {
						target[property] = value;
						// Optionally, save the config here if needed
						// target.saveConfig();
						return true;
					} else {
						throw new Error(`Property ${String(property)} does not exist on Config`);
					}
				}
			});
		}
		return Config.proxyInstance;
	}

	/**
	 * Loads the configuration from the config file.
	 * If the config file does not exist, it creates a new one with default values.
	 */
	private async loadConfig() {
		const appConfigDirPath = await path.appConfigDir();
		const configFile = await path.join(appConfigDirPath, 'config.json');

		try {
			const exists = await fs.exists(configFile);
			if (exists) {
				const content = await fs.readTextFile(configFile);
				const configData: Partial<Config> = JSON.parse(content);
				Object.assign(this, configData);
			} else {
				await this.saveConfig(configFile);
			}
		} catch (error) {
			console.error('Failed to load config:', error);
		}
	}

	/**
	 * Saves the current configuration to the config file.
	 * @param configFile Path to the config file.
	 */
	private async saveConfig(configFile: string) {
		const configData = {
			apiKey: this.apiKey,
			shortCut: this.shortCut
			// Include future config items here
		};
		await fs.writeTextFile(configFile, JSON.stringify(configData, null, 2));
	}
}

export default Config;
