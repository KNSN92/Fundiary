import type { Permission } from "fundiary-api/api/permission";

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
