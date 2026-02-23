import ArrowsPointingOutIcon from "@heroicons/react/24/solid/ArrowsPointingOutIcon";
import PencilSquareIcon from "@heroicons/react/24/solid/PencilSquareIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import { ArkErrors } from "arktype";
import { useEffect, useState } from "react";
import Pane from "@/components/diary-pane/DiaryPane";
import PaneGrid from "@/components/diary-pane/DiaryPaneGrid";
import { type DiaryDBResponse, getDiaries } from "@/db/diary-db";
import {
  type DiaryTemplateDBResponse,
  getDiaryTemplates,
} from "@/db/diary-template-db";
import fundiary from "@/fundiary";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export default function DiaryListPage() {
  const [diaryTemplates, setDiaryTemplates] = useState<
    DiaryTemplateDBResponse[]
  >([]);
  const [diaries, setDiaries] = useState<DiaryDBResponse[]>([]);
  useEffect(() => {
    getDiaryTemplates(20).then((templates) => {
      if (templates instanceof ArkErrors) {
        console.error("Failed to fetch diary templates:", templates);
        return;
      }
      const passedTemplates = templates
        .map((template) => {
          if (template instanceof ArkErrors) {
            console.error("Failed to fetch diary templates:", template);
            return null;
          }
          return template;
        })
        .filter((template) => template != null);
      setDiaryTemplates(passedTemplates as DiaryTemplateDBResponse[]);
    });
    getDiaries(20).then((fetchedDiaries) => {
      if (fetchedDiaries instanceof ArkErrors) {
        console.error("Failed to fetch diaries:", fetchedDiaries);
        return;
      }
      const passedDiaries = fetchedDiaries
        .map((diary) => {
          if (diary instanceof ArkErrors) {
            console.error("Failed to fetch diaries:", diary);
            return null;
          }
          return diary;
        })
        .filter((diary) => diary != null);
      setDiaries(passedDiaries as DiaryDBResponse[]);
    });
  }, []);
  return (
    <div className="text-base-text size-full flex justify-start text-4xl text-center">
      <div className="grow h-full p-4 overflow-y-auto">
        <h1 className="mb-4">日誌一覧</h1>
        <div className="flex flex-wrap gap-4 items-stretch">
          {diaries.map((diary) => (
            <DiaryCard key={diary.id} diary={diary} />
          ))}
        </div>
        <hr className="my-8" />
        <h1 className="mb-4">日誌テンプレート一覧</h1>
        <div className="flex flex-wrap gap-4 items-stretch">
          {diaryTemplates.map((diaryTemplate) => (
            <DiaryTemplateCard
              key={diaryTemplate.id}
              diaryTemplate={diaryTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiaryCard({ diary }: { diary: DiaryDBResponse }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  if (isFullScreen) {
    return (
      <div className="w-screen h-screen fixed inset-0 bg-base-bg z-50 flex flex-col items-center justify-center p-8">
        <button
          type="button"
          onClick={() => setIsFullScreen(false)}
          className="absolute top-4 right-4 cursor-pointer"
        >
          <XMarkIcon className="size-8" />
        </button>
        <PaneGrid col={diary.colSize} row={diary.rowSize} showGrid={true}>
          {diary.data.map((paneData) => (
            <Pane
              key={paneData.id}
              data={{
                ...paneData,
              }}
            />
          ))}
        </PaneGrid>
      </div>
    );
  }
  return (
    <Card variant="bordered" className="w-64 flex flex-col">
      <div className="grow aspect-square w-full">
        <PaneGrid
          col={diary.colSize}
          row={diary.rowSize}
          align={{ x: "center", y: "top" }}
          showGrid={true}
        >
          {diary.data.map((paneData) => (
            <Pane
              key={paneData.id}
              data={{
                ...paneData,
              }}
            />
          ))}
        </PaneGrid>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setIsFullScreen(!isFullScreen)}>
          <ArrowsPointingOutIcon className="size-8" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            fundiary.pages.open("base:diary_write_page", {
              kind: "edit",
              data: diary.id,
            });
            fundiary.tabbar.select("base:diary_list_tab");
          }}
        >
          <PencilSquareIcon className="size-8" />
        </Button>
      </div>
      <p className="text-lg">
        作成日: {new Date(diary.createdAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        更新日: {new Date(diary.updatedAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        サイズ: {diary.colSize} x {diary.rowSize}
      </p>
    </Card>
  );
}

function DiaryTemplateCard({
  diaryTemplate,
}: {
  diaryTemplate: DiaryTemplateDBResponse;
}) {
  return (
    <Card variant="bordered" className="w-64 flex flex-col">
      <div className="grow aspect-square w-full">
        <PaneGrid
          col={diaryTemplate.colSize}
          row={diaryTemplate.rowSize}
          align={{ x: "center", y: "top" }}
          showGrid={true}
        >
          {diaryTemplate.template.map((paneData) => (
            <Pane
              key={paneData.id}
              data={{
                ...paneData,
              }}
            />
          ))}
        </PaneGrid>
      </div>
      <h2 className="text-3xl font-bold">{diaryTemplate.name}</h2>
      <p className="text-lg">
        作成日: {new Date(diaryTemplate.createdAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        更新日: {new Date(diaryTemplate.updatedAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        サイズ: {diaryTemplate.colSize} x {diaryTemplate.rowSize}
      </p>
      <Button
        variant="outlined"
        className="px-2 py-1"
        onClick={() => {
          fundiary.pages.open("base:diary_write_page", {
            kind: "template",
            data: diaryTemplate.id,
          });
          fundiary.tabbar.select("base:diary_write_tab");
        }}
      >
        使う
      </Button>
    </Card>
  );
}
