import type { Permission } from "./api/permission";

// export type * from "./api";
export * from "./api";
// export type * from "./misc";
export * from "./misc";

export interface PluginManifest {
	identifier: string;
	name: string;
	version: string;
	description?: string;

	permissions: Permission[];
}

export interface PluginContext {
	manifest: PluginManifest;
}
