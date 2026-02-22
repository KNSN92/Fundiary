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
import { createDiary } from "@/db/diary-db";
import { getDiaryTemplate } from "@/db/diary-template-db";
import fundiary from "@/fundiary";
import { fromUuid } from "fundiary-api";

export default function DiaryWritePage() {
  const usingTemplate = usePagePayload("template");
  const diaryTemplateId =
    typeof usingTemplate === "string" ? fromUuid(usingTemplate) : null;
  const [diaryDataList, setDiaryDataList] = useState<DiaryPaneData[]>([]);
  const [gridSize, setGridSize] = useState({ row: 1, col: 1 });
  useEffect(() => {
    if (diaryTemplateId == null) {
      fundiary.pages.open("base:diary_list_page");
      fundiary.tabbar.select("base:diary_list_tab");
      return;
    }
    getDiaryTemplate(diaryTemplateId).then((template) => {
      if (template instanceof ArkErrors)
        throw new Error(`Failed to fetch diary template: ${template}`);
      if (template == null) return;
      setGridSize({ row: template.rowSize, col: template.colSize });
      setDiaryDataList(template.template as DiaryPaneData[]);
    });
  }, [diaryTemplateId]);
  const paramInputs = diaryDataList.map((diaryData) => {
    const pane = fundiary.diaryPanes.get(diaryData.pane);
    const args = (pane?.args ?? []) as ErasedDiaryPaneArg[];
    return args
      .filter((arg) => arg.isParam)
      .map((arg) => [arg, diaryData] as const);
  });
  return (
    <div className="text-white overflow-hidden size-full flex items-center justify-start text-4xl text-center">
      <div className="bg-base size-full basis-5xl px-4 pt-4 flex flex-col gap-4 overflow-y-auto">
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
        <button
          type="button"
          className="w-24 p-2 text-2xl bg-blue-700 disabled:bg-blue-900 hover:bg-blue-900 enabled:cursor-pointer"
          onClick={async () => {
            await createDiary(diaryDataList, diaryTemplateId ?? undefined);
            fundiary.pages.open("base:diary_list_page");
            fundiary.tabbar.select("base:diary_list_tab");
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
