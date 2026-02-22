import { ArkErrors } from "arktype";
import type {
  DiaryPaneData,
  ErasedDiaryPaneArg,
} from "fundiary-api/api/diary-pane";
import { useEffect, useState } from "react";
import { usePagePayload } from "@/app/page";
import Pane from "@/components/diary-pane/DiaryPane";
import PaneGrid from "@/components/diary-pane/DiaryPaneGrid";
import { InputComponent } from "@/components/input/Input";
import { createDiary, getDiary, updateDiary } from "@/db/diary-db";
import { getDiaryTemplate } from "@/db/diary-template-db";
import fundiary from "@/fundiary";
import { fromUuid, type Uuid } from "fundiary-api";

export default function DiaryWritePage() {
  const payload = usePagePayload();
  const [editingDiaryId, setEditingDiaryId] = useState<Uuid | null>(null);
  const [diaryTemplateId, setDiaryTemplateId] = useState<Uuid | null>(null);
  const [diaryDataList, setDiaryDataList] = useState<DiaryPaneData[]>([]);
  const [gridSize, setGridSize] = useState({ row: 1, col: 1 });

  useEffect(() => {
    if (payload == null) {
      fundiary.pages.open("base:diary_list_page");
      fundiary.tabbar.select("base:diary_list_tab");
      return;
    }

    if (payload.kind === "edit") {
      // 既存の日誌を編集
      const diaryId =
        typeof payload.data === "string" ? fromUuid(payload.data) : null;
      if (diaryId == null) return;
      getDiary(diaryId).then((diary) => {
        if (diary instanceof ArkErrors)
          throw new Error(`Failed to fetch diary for editing: ${diary}`);
        if (diary == null) return;
        setEditingDiaryId(diary.id);
        setDiaryTemplateId(null);
        setGridSize({ row: diary.rowSize, col: diary.colSize });
        setDiaryDataList(diary.data as DiaryPaneData[]);
      });
    } else if (payload.kind === "template") {
      // テンプレートから新規日誌を作成
      const templateId =
        typeof payload.data === "string" ? fromUuid(payload.data) : null;
      if (templateId == null) return;
      getDiaryTemplate(templateId).then((template) => {
        if (template instanceof ArkErrors)
          throw new Error(`Failed to fetch diary template: ${template}`);
        if (template == null) return;
        setEditingDiaryId(null);
        setDiaryTemplateId(templateId);
        setGridSize({ row: template.rowSize, col: template.colSize });
        setDiaryDataList(template.template as DiaryPaneData[]);
      });
    }
  }, [payload]);
  const paramInputs = diaryDataList.map((diaryData) => {
    const pane = fundiary.diaryPanes.get(diaryData.pane);
    const args = (pane?.args ?? []) as ErasedDiaryPaneArg[];
    return args
      .filter((arg) => arg.isParam)
      .map((arg) => [arg, diaryData] as const);
  });
  return (
    <div className="text-white overflow-hidden size-full flex items-center justify-start text-4xl text-center">
      <div className="bg-base size-full basis-5xl px-4 pt-16 flex flex-col gap-4 overflow-y-auto">
        {paramInputs.map((paneParamInputs) => (
          <>
            {paneParamInputs.map(([arg, diaryData]) => (
              <InputComponent
                input={arg.inputType}
                labelText={
                  paneParamInputs.length > 1
                    ? `${diaryData.name} - ${arg.name}`
                    : diaryData.name
                }
                key={`${diaryData.id}-${arg.name}`}
                value={diaryData.data[arg.dataKey]}
                setValue={(v: unknown) => {
                  diaryData.data[arg.dataKey] = v;
                  setDiaryDataList([...diaryDataList]);
                }}
              />
            ))}
          </>
        ))}
        <div className="flex gap-4 flex-row">
          <button
            type="button"
            className="w-fit px-4 py-2 text-2xl bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer"
            onClick={async () => {
              if (editingDiaryId != null) {
                await updateDiary(editingDiaryId, diaryDataList);
              } else {
                await createDiary(diaryDataList, diaryTemplateId ?? undefined);
              }
              fundiary.pages.open("base:diary_list_page");
              fundiary.tabbar.select("base:diary_list_tab");
            }}
          >
            保存
          </button>
          <button
            type="button"
            className="w-fit px-4 py-2 text-2xl bg-red-700 disabled:bg-red-900 hover:bg-red-900 enabled:cursor-pointer text-nowrap"
            onClick={async () => {
              fundiary.pages.open("base:diary_list_page");
              fundiary.tabbar.select("base:diary_list_tab");
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
      <div className="relative size-full px-8 pt-16">
        <PaneGrid showGrid={true} row={gridSize.row} col={gridSize.col}>
          {diaryDataList.map((data) => (
            <Pane data={data} key={data.id} />
          ))}
        </PaneGrid>
      </div>
    </div>
  );
}
