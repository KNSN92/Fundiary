import ArrowsPointingOutIcon from "@heroicons/react/24/solid/ArrowsPointingOutIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import { ArkErrors } from "arktype";
import { useEffect, useState } from "react";
import * as Calendar from "@/components/calendar/Calendar";
import Pane from "@/components/diary-pane/DiaryPane";
import PaneGrid from "@/components/diary-pane/DiaryPaneGrid";
import { type DiaryDBResponse, getDiaries } from "@/db/diary-db";
import {
  type DiaryTemplateDBResponse,
  getDiaryTemplates,
} from "@/db/diary-template-db";
import fundiary from "@/fundiary";

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
    <div className="text-white size-full flex justify-start text-4xl text-center">
      <div className="w-96 h-full px-4 pt-16">
        <Calendar.Root>
          <Calendar.Header>
            <Calendar.DateDisplay />
            <Calendar.Control />
          </Calendar.Header>
          <Calendar.Body>
            <Calendar.WeekdaysRow />
            <Calendar.DaysGrid />
          </Calendar.Body>
        </Calendar.Root>
      </div>
      <div className="grow h-full p-4 overflow-y-auto border-l-2 border-base-dark">
        <h1 className="mb-4">日誌一覧</h1>
        <div className="flex flex-wrap gap-4 items-stretch">
          {diaries.map((diary) => (
            <DiaryCard key={diary.id} diary={diary} />
          ))}
        </div>
        <hr className="my-8" />
        <h1 className="mb-4">日誌テンプレート一覧</h1>
        <div className="flex flex-wrap gap-4">
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
    <div key={diary.id} className="w-64 flex flex-col">
      <div className="grow">
        <PaneGrid
          col={diary.colSize}
          row={diary.rowSize}
          align={{ x: "left", y: "top" }}
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
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        <ArrowsPointingOutIcon className="size-8" />
      </button>
      <p className="text-lg">
        作成日: {new Date(diary.createdAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        更新日: {new Date(diary.updatedAt).toLocaleDateString()}
      </p>
      <p className="text-lg">
        サイズ: {diary.colSize} x {diary.rowSize}
      </p>
    </div>
  );
}

function DiaryTemplateCard({
  diaryTemplate,
}: {
  diaryTemplate: DiaryTemplateDBResponse;
}) {
  return (
    <div key={diaryTemplate.id} className="w-64 h-fit">
      <div className="grow">
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
      <button
        type="button"
        className="border border-white rounded-xl px-2 py-1 cursor-pointer hover:brightness-75"
        onClick={() => {
          fundiary.pages.open("base:diary_write_page", {
            kind: "template",
            data: diaryTemplate.id,
          });
          fundiary.tabbar.select("base:diary_write_tab");
        }}
      >
        使う
      </button>
    </div>
  );
}
