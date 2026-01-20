import { type } from "arktype";
import type { DiaryPane } from "fundiary-api/api/diary-pane";
import type { ReactNode } from "react";

export type TextPaneData = {
	text: string;
	fontSize: number;
	color: number;
};

export default {
	identifier: "base:text",
	name: "テキスト",
	size: { width: 1, height: 1 },
	dataValidator: type({
		text: "string",
		fontSize: "number",
		color: "number",
	}),
	initData: () => ({
		text: "",
		fontSize: 16,
		color: 0xffffff,
	}),
	args: [
		{
			dataKey: "text",
			name: "テキスト",
			description: "日記の内容やタイトルまで、様々な用途に使えます。",
			isParam: true,
			inputType: {
				kind: "text",
				placeholder: "今日あった事は...",
			},
		},
		{
			dataKey: "fontSize",
			name: "フォントサイズ",
			description: "テキストのフォントサイズ（px）",
			isParam: false,
			inputType: {
				kind: "number",
				min: 8,
				max: 72,
				unit: "px",
			},
		},
		{
			dataKey: "color",
			name: "文字色",
			description: "テキストの色",
			isParam: false,
			inputType: {
				kind: "color",
			},
		},
	],
	resize: {},
	component: TextPaneComponent,
} as DiaryPane<TextPaneData>;

function TextPaneComponent({ data }: { data: TextPaneData }) {
	const text = data.text.split("\n").reduce((acc, v, i, arr) => {
		acc.push(v);
		// biome-ignore lint: lint/suspicious/noArrayIndexKey
		if (i < arr.length - 1) acc.push(<br key={i} />);
		return acc;
	}, [] as ReactNode[]);

	const colorHex = `#${data.color.toString(16).padStart(6, "0")}`;

	return (
		<div
			className="w-full h-full text-wrap wrap-break-word overflow-y-auto flex items-center justify-center"
			style={{
				fontSize: `${data.fontSize}px`,
				color: colorHex,
			}}
		>
			{text}
		</div>
	);
}
