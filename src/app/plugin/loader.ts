import type { PluginContext, PluginManifest } from "fundiary-api";

const plugins: { [id: string]: PluginManifest } = {};
export function registerPlugin(plugin: PluginManifest) {
	Object.freeze(plugin);
	plugins[plugin.identifier] = plugin;
}

export default function loadPlugins() {
	Object.values(plugins).forEach((plugin) => {
		const context: PluginContext = {
			manifest: plugin,
		};
		Object.freeze(context);
	});
}
