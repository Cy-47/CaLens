// $lib/config.ts
import { path } from '@tauri-apps/api';
import * as fs from '@tauri-apps/plugin-fs';

/**
 * Singleton class to manage application configuration.
 */
class Config {
	private static instance: Config;
	private static proxyInstance: Config;
	private static appConfigDirPath: string;
	private static configFilePath: string;
	private static firstTime: boolean = false;
	[key: string]: any;
	[key: symbol]: any;

	// Define all config items here
	public apiKey: string = '';
	public shortCut: string = 'CommandOrControl+Shift+C';

	private constructor() {}

	/**
	 * Returns the singleton instance of the Config class.
	 * @returns {Promise<Config>} The singleton instance.
	 */
	public static async getInstance(): Promise<Config> {
		if (!Config.instance) {
			Config.instance = new Config();
			Config.appConfigDirPath = await path.appConfigDir();
			Config.configFilePath = await path.join(Config.appConfigDirPath, 'config.json');

			await Config.instance.loadConfig();
			Config.proxyInstance = new Proxy(Config.instance, {
				set(target, property, value) {
					if (property in target) {
						target[property] = value;
						target.saveConfig();
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
		try {
			const exists = await fs.exists(Config.configFilePath);
			Config.firstTime = !exists;
			if (exists) {
				const content = await fs.readTextFile(Config.configFilePath);
				const configData: Partial<Config> = JSON.parse(content);
				Object.assign(this, configData);
			} else {
				await this.saveConfig();
			}
		} catch (error) {
			console.error('Failed to load config:', error);
		}
	}

	/**
	 * Saves the current configuration to the config file.
	 * @param configFile Path to the config file.
	 */
	private async saveConfig() {
		const configData = {
			apiKey: this.apiKey,
			shortCut: this.shortCut
			// Include future config items here
		};
		console.log('Saving config:', configData);
		// Create dir if it does not exist
		if (!(await fs.exists(Config.appConfigDirPath))) {
			console.log('Creating config dir');
			await fs.mkdir(Config.appConfigDirPath, { recursive: true });
		}
		await fs.writeTextFile(Config.configFilePath, JSON.stringify(configData, null, 2));
	}

	/**
	 * Returns whether the application is running for the first time.
	 * @returns {boolean} True if the application is running for the first time.
	 */
	public static isFirstTime(): boolean {
		return Config.firstTime;
	}
}

export default Config;
