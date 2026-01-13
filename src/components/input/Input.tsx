import { useId } from "react";
import type {
	CheckBoxInput,
	ColorInput,
	DateInput,
	Input,
	InputKindToDataType,
	NumberInput,
	TextInput,
	TitleInput,
} from "@/app/input";

interface Props<T extends Input> {
	id: string;
	input: T;
	value: InputKindToDataType[T["kind"]] | undefined;
	setValue: (value: InputKindToDataType[T["kind"]]) => void;
}

export function TitleInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<TitleInput>) {
	return (
		<input
			type="text"
			placeholder={input.placeholder ?? ""}
			minLength={input.minLength}
			maxLength={input.maxLength}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			id={id}
			className="w-full h-[1.5em] bg-transparent border-b border-white text-white text-2xl"
		/>
	);
}

export function TextInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<TextInput>) {
	return (
		<textarea
			placeholder={input.placeholder ?? ""}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			id={id}
			className="w-full h-[6em] p-2 bg-transparent border border-white text-white text-lg overflow-y-auto min-h-[2.5em] max-h-96"
		></textarea>
	);
}

export function CheckBoxInputComponent({
	id,
	value,
	setValue,
}: Props<CheckBoxInput>) {
	return (
		<input
			type="checkbox"
			checked={value}
			onChange={(e) => setValue(e.target.checked)}
			id={id}
			className="w-5 h-5 bg-transparent border border-white accent-white"
		/>
	);
}

export function NumberInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<NumberInput>) {
	return (
		<input
			type="number"
			min={input.min}
			max={input.max}
			value={value}
			onChange={(e) => setValue(e.target.valueAsNumber)}
			id={id}
			className="w-full h-[1.5em] bg-transparent border-b border-white text-white text-2xl"
		/>
	);
}

export function ColorInputComponent({
	id,
	value,
	setValue,
}: Props<ColorInput>) {
	return (
		<input
			type="color"
			value={value ? `#${value.toString(16).padStart(6, "0")}` : undefined}
			onChange={(e) => {
				const hex = e.target.value;
				const r = parseInt(hex.slice(1, 3), 16);
				const g = parseInt(hex.slice(3, 5), 16);
				const b = parseInt(hex.slice(5, 7), 16);
				setValue((r << 16) + (g << 8) + b);
			}}
			id={id}
			className="w-10 h-10 bg-transparent border border-white"
		/>
	);
}

export function DateInputComponent({ id, value, setValue }: Props<DateInput>) {
	return (
		<input
			type="date"
			value={value ? value.toISOString().split("T")[0] : undefined}
			onChange={(e) => setValue(new Date(e.target.value))}
			id={id}
			className="w-full h-[1.5em] bg-transparent border-b border-white text-white text-2xl"
		/>
	);
}

interface InputProps {
	input: Input;
	labelText: string;
	value: InputKindToDataType[this["input"]["kind"]] | undefined;
	setValue: (value: InputKindToDataType[this["input"]["kind"]]) => void;
}

export function InputComponent({
	input,
	labelText,
	value,
	setValue,
}: InputProps) {
	const id = useId();
	let inputComponent = null;
	switch (input.kind) {
		case "title":
			inputComponent = (
				<TitleInputComponent
					id={id}
					input={input}
					value={value as string}
					setValue={setValue}
				/>
			);
			break;
		case "text":
			inputComponent = (
				<TextInputComponent
					id={id}
					input={input}
					value={value as string}
					setValue={setValue}
				/>
			);
			break;
		case "checkbox":
			inputComponent = (
				<CheckBoxInputComponent
					id={id}
					input={input}
					value={value as boolean}
					setValue={setValue}
				/>
			);
			break;
		case "number":
			inputComponent = (
				<NumberInputComponent
					id={id}
					input={input}
					value={value as number}
					setValue={setValue}
				/>
			);
			break;
		case "color":
			inputComponent = (
				<ColorInputComponent
					id={id}
					input={input}
					value={value as number}
					setValue={setValue}
				/>
			);
			break;
		case "date":
			inputComponent = (
				<DateInputComponent
					id={id}
					input={input}
					value={value as Date}
					setValue={setValue}
				/>
			);
			break;
		default:
			throw new Error(
				`Unknown input kind: ${(input as { kind: string }).kind}`,
			);
	}
	return (
		<label htmlFor={id} className="flex flex-col items-start">
			<span className="text-2xl">{labelText}</span>
			{inputComponent}
		</label>
	);
}
