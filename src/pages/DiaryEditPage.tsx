import { useState } from "react";
import { v7 as uuidv7 } from "uuid";
import {
	createDiaryPaneData,
	type DiaryPaneArg,
	type DiaryPaneData,
	getAllDiaryPanes,
	getDiaryPane,
} from "@/app/diary-pane";
import textPane from "@/app/diary-pane/text-pane";
import { openPage } from "@/app/page";
import { selectTab } from "@/app/tabbar";
import EditablePane from "@/components/diary-pane/edit/EditDiaryPane";
import EditablePaneGrid from "@/components/diary-pane/edit/EditDiaryPaneGrid";
import EditDiaryPaneGridResizer from "@/components/diary-pane/edit/EditDiaryPaneGridResizer";
import { InputComponent } from "@/components/input/Input";
import { createDiaryTemplate } from "@/db/diary-template-db";

const initialDiaryDataList: DiaryPaneData[] = [];

export default function DiaryEditPage() {
	const [gridSize, setGridSize] = useState({ row: 4, col: 4 });
	const [selectedPaneId, setSelectedPaneId] = useState<string | null>(null);
	const [templateName, setTemplateName] = useState<string | null>(null);
	const [diaryDataList, setDiaryDataList] =
		useState<DiaryPaneData[]>(initialDiaryDataList);
	const selectedPaneData =
		diaryDataList.find((diaryData) => diaryData.id === selectedPaneId) ?? null;
	const selectedPane =
		(selectedPaneData && getDiaryPane(selectedPaneData.pane)) ?? null;
	const canResizeCol = diaryDataList.every(
		(diaryData) => diaryData.pos.x + diaryData.size.width < gridSize.col,
	);
	const canResizeRow = diaryDataList.every(
		(diaryData) => diaryData.pos.y + diaryData.size.height < gridSize.row,
	);
	return (
		<div className="text-white bg-blue-600 overflow-hidden size-full flex items-center justify-start text-4xl text-center">
			<div className="relative h-full p-8 grow overflow-hidden">
				<div className="absolute bottom-0 left-0 p-4 z-10">
					<EditDiaryPaneGridResizer
						canResize={{ row: canResizeRow, col: canResizeCol }}
						size={gridSize}
						setSize={setGridSize}
					/>
				</div>
				<EditablePaneGrid
					showGrid={true}
					row={gridSize.row}
					col={gridSize.col}
					onClick={() => setSelectedPaneId(null)}
				>
					{diaryDataList.map((data, i) => (
						<EditablePane
							data={data}
							setData={(data) => {
								diaryDataList[i] = data;
								setDiaryDataList([...diaryDataList]);
							}}
							focused={selectedPaneId === data.id}
							onClick={() => setSelectedPaneId(data.id)}
							key={data.id}
						/>
					))}
				</EditablePaneGrid>
			</div>
			<div className="bg-base-bg basis-80 h-full text-xl px-4 pt-4 overflow-y-auto">
				<div className="flex flex-col gap-4">
					<h1 className="font-bold text-3xl">テンプレート設定</h1>
					<div className="w-full flex gap-2">
						<button
							type="button"
							disabled={!templateName}
							onClick={async () => {
								if (templateName != null) {
									await createDiaryTemplate(templateName, diaryDataList);
									openPage("base:diary_list_page");
									selectTab("base:diary_list_tab");
								}
							}}
							className="w-24 bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer"
						>
							保存
						</button>
						<input
							type="text"
							placeholder="名称"
							className="w-full border-b border-white flex flex-col gap-4"
							value={templateName ?? ""}
							onChange={(e) => setTemplateName(e.target.value)}
						/>
					</div>
				</div>

				{selectedPaneData ? (
					<>
						<hr className="my-8 border-dashed" />
						<div className="flex flex-col gap-4">
							<h1 className="font-bold text-3xl">編集</h1>
							<InputComponent
								input={{
									kind: "title",
								}}
								labelText="名称"
								value={selectedPaneData.name}
								setValue={(value) => {
									selectedPaneData.name = value as string;
									setDiaryDataList([...diaryDataList]);
								}}
							/>
							{(selectedPane?.args as DiaryPaneArg<any>[]).map((arg) => (
								<InputComponent
									key={`${selectedPaneData.id}-${arg.name}`}
									input={arg.inputType}
									labelText={arg.name + (arg.isParam ? " (パラメータ)" : "")}
									value={(selectedPaneData.data as any)[arg.dataKey]}
									setValue={(v) => {
										(selectedPaneData.data as any)[arg.dataKey] = v;
										setDiaryDataList([...diaryDataList]);
									}}
								/>
							))}
						</div>
					</>
				) : (
					<>
						<hr className="my-8 border-dashed" />
						<div className="flex flex-col gap-4">
							<h1 className="font-bold text-3xl">追加</h1>
							{getAllDiaryPanes().map((pane) => (
								<button
									type="button"
									className="w-fit p-2 mx-auto text-2xl bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer"
									onClick={() => {
										setDiaryDataList([
											...diaryDataList,
											createDiaryPaneData(
												pane,
												{ x: 0, y: 0 },
												{ width: 1, height: 1 },
											),
										]);
									}}
									key={pane.identifier}
								>
									{pane.name}
								</button>
							))}
							
						</div>
					</>
				)}
			</div>
		</div>
	);
}
