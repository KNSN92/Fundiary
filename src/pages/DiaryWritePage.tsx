import { ArkErrors } from "arktype";
import { useEffect, useState } from "react";
import {
	type DiaryPaneArg,
	type DiaryPaneData,
	getDiaryPane,
} from "@/app/diary-pane";
import { openPage, usePagePayload } from "@/app/page";
import { selectTab } from "@/app/tabbar";
import Pane from "@/components/diary-pane/DiaryPane";
import PaneGrid from "@/components/diary-pane/DiaryPaneGrid";
import { InputComponent } from "@/components/input/Input";
import { createDiary } from "@/db/diary-db";
import { getDiaryTemplate } from "@/db/diary-template-db";

export default function DiaryWritePage() {
	const usingTemplate = usePagePayload("template");
	const diaryTemplateId =
		typeof usingTemplate === "string" ? usingTemplate : null;
	const [diaryDataList, setDiaryDataList] = useState<DiaryPaneData[]>([]);
	const [gridSize, setGridSize] = useState({ row: 1, col: 1 });
	useEffect(() => {
		if (typeof usingTemplate !== "string") {
			openPage("base:diary_list_page");
			selectTab("base:diary_list_tab");
			return;
		}
		getDiaryTemplate(usingTemplate as string).then((template) => {
			if (template instanceof ArkErrors)
				throw new Error(`Failed to fetch diary template: ${template}`);
			if (template == null) return;
			setGridSize({ row: template.rowSize, col: template.colSize });
			setDiaryDataList(template.template as DiaryPaneData[]);
		});
	}, [usingTemplate]);
	const paramInputs = diaryDataList.flatMap((diaryData) => {
		const pane = getDiaryPane(diaryData.pane);
		return (pane?.args as DiaryPaneArg<any>[])
			.filter((arg) => arg.isParam)
			.map((arg) => [arg, diaryData] as const);
	});
	return (
		<div className="text-white bg-blue-600 overflow-hidden size-full flex items-center justify-start text-4xl text-center">
			<div className="bg-base-bg size-full basis-5xl px-4 pt-4 flex flex-col gap-4 overflow-y-auto">
				{paramInputs.map(([arg, diaryData]) => (
					<InputComponent
						input={arg.inputType}
						labelText={diaryData.name}
						key={`${diaryData.id}-${arg.name}`}
						value={diaryData.data[arg.dataKey] as any}
						setValue={(v) => {
							(diaryData.data as any)[arg.dataKey] = v;
							setDiaryDataList([...diaryDataList]);
						}}
					/>
				))}
				<button
					type="button"
					className="w-24 p-2 text-2xl bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer"
					onClick={async () => {
						await createDiary(diaryDataList, diaryTemplateId ?? undefined);
						openPage("base:diary_list_page");
						selectTab("base:diary_list_tab");
					}}
				>
					保存
				</button>
			</div>
			<div className="relative size-full p-8">
				<PaneGrid showGrid={true} row={gridSize.row} col={gridSize.col}>
					{diaryDataList.map((data) => (
						<Pane data={data} key={data.id} />
					))}
				</PaneGrid>
			</div>
		</div>
	);
}
