import { type } from "arktype";

import { call } from "./lib/call";

export const PermissionKinds = [
	"permission:request",
	"permission:revoke",
	"permission:has",

	"diary:read",
	"diary:write",
	"diary:delete",
	"diary:pane",

	"ui:page",
	"ui:tab",

	"storage",
] as const;

export type Permission = (typeof PermissionKinds)[number];

const hasPermResValidator = type("boolean").assert;
export async function hasPerm(permission: Permission): Promise<boolean> {
	return hasPermResValidator(await call("permission:has", { permission }));
}

export async function requestPerm(permission: Permission) {
	call(permission, { permission });
}

export async function revokePerm(permission: Permission) {
	call(permission, { permission });
}

export class Permissions {
	private permissions: Set<Permission> = new Set();

	constructor(permissions: Permission[]) {
		this.permissions = new Set(permissions);
	}

	has(permission: Permission): boolean {
		return this.permissions.has(permission);
	}

	request(permission: Permission): void {
		this.permissions.add(permission);
	}

	revoke(permission: Permission): void {
		this.permissions.delete(permission);
	}
}
