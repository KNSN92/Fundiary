import { type } from "arktype";
import { ReactNode } from "react";
import type { DiaryPane } from "../diary-pane";

export type TextPaneData = {
	text: string;
	fontsize: number;
	color: number;
	day: Date;
};

export default {
	identifier: "base:text",
	name: "テキスト",
	size: { width: 1, height: 1 },
	dataValidator: type({
		text: "string",
		fontsize: "number",
		color: "0 <= number < 16777216",
		day: "Date",
	}),
	initData: () => ({
		text: "",
		fontsize: 32,
		color: 0,
		day: new Date(),
	}),
	args: [
		{
			dataKey: "text",
			name: "text",
			description: "日記の内容やタイトルまで、様々な用途に使えます。",
			isParam: true,
			inputType: {
				kind: "text",
				placeholder: "今日あった事は...",
			},
		},
		{
			dataKey: "fontsize",
			name: "フォントサイズ",
			inputType: {
				kind: "number",
				min: 1,
			},
		},
		{
			dataKey: "color",
			name: "背景色",
			inputType: {
				kind: "color",
				defaultValue: 0,
			},
		},
		{
			dataKey: "day",
			name: "日付",
			inputType: {
				kind: "date",
				autoToday: true,
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
	return (
		<div
			className="w-full h-full text-wrap wrap-break-word overflow-y-auto flex items-center justify-center"
			style={{
				backgroundColor: `#${data.color.toString(16).padStart(6, "0")}`,
				fontSize: `${data.fontsize}px`,
			}}
		>
			{text}
		</div>
	);
}
