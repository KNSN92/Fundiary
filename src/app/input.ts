export interface TitleInput {
	kind: "title";
	placeholder?: string;
	maxLength?: number;
	minLength?: number;
}

export interface TextInput {
	kind: "text";
	placeholder?: string;
}

export interface CheckBoxInput {
	kind: "checkbox";
}

export interface NumberInput {
	kind: "number";
	min?: number;
	max?: number;
	unit?: string;
}

export interface ColorInput {
	kind: "color";
}

export interface DateInput {
	kind: "date";
	autoToday?: boolean;
}

export type Input =
	| TitleInput
	| TextInput
	| CheckBoxInput
	| NumberInput
	| ColorInput
	| DateInput;

// Inputのkindからデータ型へのマッピング
export interface InputKindToDataType {
	title: string;
	text: string;
	checkbox: boolean;
	number: number;
	color: number;
	date: Date;
}

// export function defaultValue<T extends Input>(
// 	input: T,
// ): InputKindToDataType[T["kind"]] {
// 	switch (input.kind) {
// 		case "title":
// 		case "text":
// 			return "" as InputKindToDataType[T["kind"]];
// 		case "checkbox":
// 			return false as InputKindToDataType[T["kind"]];
// 		case "number":
// 			return (input.defaultValue ?? 0) as InputKindToDataType[T["kind"]];
// 		case "color":
// 			return (input.defaultValue ?? 0) as InputKindToDataType[T["kind"]];
// 		case "date":
// 			return input.autoToday ? new Date() : new Date(0);
// 	}
// }
