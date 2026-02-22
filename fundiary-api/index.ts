import type { Permission } from "./api/permission";
import type { Uuid } from "./misc/uuid";

export * from "./api";
export * from "./misc";
export type { Uuid } from "./misc/uuid";
export { uuid, fromUuid, fromUuidOrThrow } from "./misc/uuid";

export interface PluginManifest {
	identifier: Uuid;
	name: string;
	version: string;
	description?: string;

	permissions: Permission[];
}

export interface PluginContext {
	manifest: PluginManifest;
}
