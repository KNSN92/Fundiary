import { type } from "arktype";

export type Identifier = `${string}:${string}`;

export function id(namespace: string, name: string): Identifier {
	if (namespace.includes(":") || name.includes(":")) {
		throw new Error("Namespace and name must not contain ':'");
	}
	return `${namespace}:${name}`;
}

export const IdentifierValidator = type(/[\w\d_-]+:[\w\d_-]/);
