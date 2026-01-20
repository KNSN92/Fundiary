import { type Type, type } from "arktype";
import type { Identifier } from "fundiary-api";
import { IdentifierValidator } from "fundiary-api/misc/identifier";
import type { ReactNode } from "react";
import { v7 as uuidv7 } from "uuid";
import type { Input, InputKindToDataType } from "../../src/app/input";

export interface PanePos {
	x: number;
	y: number;
}

export interface PaneSize {
	width: number;
	height: number;
}

// データ型からInputのkindへの逆引きマッピング
type DataTypeToInputKind<T> = {
	[K in keyof InputKindToDataType]: InputKindToDataType[K] extends T
		? T extends InputKindToDataType[K]
			? K
			: never
		: never;
}[keyof InputKindToDataType];

export type DiaryPaneArg<T, K extends keyof T = keyof T> = K extends keyof T
	? {
			inputType: Extract<Input, { kind: DataTypeToInputKind<T[K]> }>;
			dataKey: K;
			name: string;
			description?: string;
			isParam: boolean;
		}
	: never;

/**
 * 型消去されたDiaryPaneArg
 * ジェネリクスなしでargsを扱う場合に使用
 */
export interface ErasedDiaryPaneArg {
	inputType: Input;
	dataKey: string | number | symbol;
	name: string;
	description?: string;
	isParam: boolean;
}

export interface DiaryPane<T> {
	identifier: Identifier;
	name: string;
	size: PaneSize;
	dataValidator: Type<T>;
	initData: () => T;
	args: DiaryPaneArg<T>[];
	component: (props: { data: T }) => ReactNode;
	resize?: {
		minSize?: PaneSize;
		maxSize?: PaneSize;
		keepAspectRatio?: boolean;
	};
}

export interface DiaryPaneData {
	id: string;
	name: string;
	pane: Identifier;
	pos: PanePos;
	size: PaneSize;
	data: Record<string | number | symbol, unknown>;
}

export const DiaryPaneDataValidator = type({
	id: "string.uuid.v7",
	name: "string",
	pane: IdentifierValidator,
	pos: {
		x: "number.integer",
		y: "number.integer",
	},
	size: {
		width: "number.integer >= 0",
		height: "number.integer >= 0",
	},
	data: "unknown",
});

export function createDiaryPaneData<T>(
	pane: DiaryPane<T>,
	pos: PanePos,
	size: PaneSize,
): DiaryPaneData {
	return {
		id: uuidv7(),
		name: pane.name,
		pane: pane.identifier,
		pos,
		size,
		data: pane.initData() as Record<string | number | symbol, unknown>,
	};
}
