import { useEffect, useId, useRef, useState, useTransition } from "react";
import type {
	BulletListInput,
	CheckBoxInput,
	ColorInput,
	DateInput,
	ImageInput,
	Input,
	InputKindToDataType,
	NumberInput,
	SelectInput,
	TextInput,
	TitleInput,
} from "@/app/input";
import { deleteImage, getImageAsObjectURL, saveImage } from "@/db/image-db";

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

export function BulletListInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<BulletListInput>) {
	const items = value ?? [];

	const addItem = () => {
		if (input.maxItems != null && items.length >= input.maxItems) return;
		setValue([...items, ""]);
	};

	const removeItem = (index: number) => {
		if (input.minItems != null && items.length <= input.minItems) return;
		setValue(items.filter((_, i) => i !== index));
	};

	const updateItem = (index: number, newValue: string) => {
		const newItems = [...items];
		newItems[index] = newValue;
		setValue(newItems);
	};

	return (
		<div id={id} className="w-full flex flex-col gap-2">
			<ul className="list-disc list-inside flex flex-col gap-1">
				{items.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: 箇条書きアイテムには一意のIDがないため、インデックスをキーとして使用
					<li key={index} className="flex items-center gap-2">
						<span className="text-white">•</span>
						<input
							type="text"
							value={item}
							placeholder={input.placeholder ?? ""}
							onChange={(e) => updateItem(index, e.target.value)}
							className="flex-1 bg-transparent border-b border-white text-white text-lg"
						/>
						<button
							type="button"
							onClick={() => removeItem(index)}
							disabled={
								input.minItems != null && items.length <= input.minItems
							}
							className="text-red-400 hover:text-red-300 disabled:text-gray-600 disabled:cursor-not-allowed cursor-pointer"
						>
							✕
						</button>
					</li>
				))}
			</ul>
			<button
				type="button"
				onClick={addItem}
				disabled={input.maxItems != null && items.length >= input.maxItems}
				className="w-fit px-2 py-1 text-sm bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white cursor-pointer"
			>
				+ 追加
			</button>
		</div>
	);
}
export function SelectInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<SelectInput>) {
	return (
		<select
			id={id}
			value={value ?? ""}
			onChange={(e) => setValue(e.target.value)}
			className="w-full h-[2em] px-2 bg-base-dark border border-white text-white text-xl cursor-pointer"
		>
			{input.placeholder && (
				<option value="" disabled>
					{input.placeholder}
				</option>
			)}
			{input.options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}

export function ImageInputComponent({
	id,
	input,
	value,
	setValue,
}: Props<ImageInput>) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const previewUrlRef = useRef<string | null>(null);
	const [isLoading, startLoad] = useTransition();
	const [error, setError] = useState<string | null>(null);

	// 画像IDが変更されたらプレビューを更新
	useEffect(() => {
		// 古いURLをクリーンアップ
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}

		if (!value) {
			setPreviewUrl(null);
			return;
		}

		let cancelled = false;
		getImageAsObjectURL(value).then((url) => {
			if (cancelled) {
				if (url) URL.revokeObjectURL(url);
				return;
			}
			previewUrlRef.current = url;
			setPreviewUrl(url);
		});

		return () => {
			cancelled = true;
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
				previewUrlRef.current = null;
			}
		};
	}, [value]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError(null);

		// サイズチェック
		if (input.maxSizeBytes && file.size > input.maxSizeBytes) {
			const maxSizeMB = (input.maxSizeBytes / 1024 / 1024).toFixed(1);
			setError(`ファイルサイズが大きすぎます（最大${maxSizeMB}MB）`);
			return;
		}

		startLoad(async () => {
			try {
				// 既存の画像があれば削除
				if (value) {
					await deleteImage(value);
				}

				// 新しい画像を保存
				const imageId = await saveImage(file);
				setValue(imageId);
			} catch (err) {
				setError("画像の保存に失敗しました");
				console.error("Failed to save image:", err);
			}
		});

		// inputをリセット（同じファイルを再選択できるように）
		e.target.value = "";
	};

	const handleRemove = async () => {
		if (!value) return;

		startLoad(async () => {
			try {
				await deleteImage(value);
				setValue("");
				setPreviewUrl(null);
			} catch (err) {
				setError("画像の削除に失敗しました");
				console.error("Failed to delete image:", err);
			}
		});
	};

	return (
		<div id={id} className="w-full flex flex-col gap-2">
			<input
				ref={fileInputRef}
				type="file"
				accept={input.accept ?? "image/*"}
				onChange={handleFileSelect}
				className="hidden"
			/>

			{previewUrl ? (
				<div className="relative w-full">
					<img
						src={previewUrl}
						alt="プレビュー"
						className="max-w-full max-h-64 object-contain border border-white rounded"
					/>
					<div className="mt-2 flex gap-2">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={isLoading}
							className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-600 disabled:bg-gray-600 text-white cursor-pointer disabled:cursor-not-allowed"
						>
							変更
						</button>
						<button
							type="button"
							onClick={handleRemove}
							disabled={isLoading}
							className="px-3 py-1 text-sm bg-red-700 hover:bg-red-600 disabled:bg-gray-600 text-white cursor-pointer disabled:cursor-not-allowed"
						>
							削除
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isLoading}
					className="w-full h-32 border-2 border-dashed border-white hover:border-blue-400 flex flex-col items-center justify-center gap-2 text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? (
						<span>アップロード中...</span>
					) : (
						<>
							<span className="text-3xl">📷</span>
							<span className="text-sm">クリックして画像を選択</span>
						</>
					)}
				</button>
			)}

			{error && <p className="text-red-400 text-sm">{error}</p>}
		</div>
	);
}

interface InputProps<T extends Input = Input> {
	input: T;
	labelText: string;
	value: InputKindToDataType[T["kind"]] | undefined;
	setValue: (value: InputKindToDataType[T["kind"]]) => void;
}

/**
 * unknown型のデータを安全に扱うためのInputProps
 * DiaryPaneDataのような動的なデータ構造で使用
 */
export interface DynamicInputProps {
	input: Input;
	labelText: string;
	value: unknown;
	setValue: (value: unknown) => void;
}

export function InputComponent({
	input,
	labelText,
	value,
	setValue,
}: InputProps | DynamicInputProps) {
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
		case "bulletList":
			inputComponent = (
				<BulletListInputComponent
					id={id}
					input={input}
					value={value as string[]}
					setValue={setValue}
				/>
			);
			break;
		case "select":
			inputComponent = (
				<SelectInputComponent
					id={id}
					input={input}
					value={value as string}
					setValue={setValue}
				/>
			);
			break;
		case "image":
			inputComponent = (
				<ImageInputComponent
					id={id}
					input={input}
					value={value as string}
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
