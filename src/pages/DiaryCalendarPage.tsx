import ArrowsPointingOutIcon from "@heroicons/react/24/solid/ArrowsPointingOutIcon";
import { ArkErrors } from "arktype";
import type { DiaryPaneData } from "fundiary-api/api/diary-pane";
import { Suspense, use, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import * as Calendar from "@/components/calendar/Calendar";
import { Button } from "@/components/common/Button";
import LoadingSpin from "@/components/common/LoadingSpin";
import Pane from "@/components/diary-pane/DiaryPane";
import PaneGrid from "@/components/diary-pane/DiaryPaneGrid";
import { type DiaryDBResponse, getDiariesByDate } from "@/db/diary-db";
import fundiary from "@/fundiary";
import cn from "@/libs/cn";
import { XMarkIcon } from "@heroicons/react/24/solid";
import type { Identifier } from "fundiary-api";

function showDiaryFullScreen(diary: DiaryDBResponse) {
  const id: Identifier = `diary_fullscreen:${diary.id}`;
  fundiary.modals.show({
    id,
    bgClickToClose: true,
    centered: true,
    render: () => (
      <div
        className="max-w-[80vw] h-[80vh] size-auto bg-base-bg rounded-xl"
        style={{
          aspectRatio: `${diary.colSize} / ${diary.rowSize}`,
        }}
      >
        <button
          type="button"
          onClick={() => fundiary.modals.closeThis(id)}
          className="absolute top-4 right-4 cursor-pointer"
        >
          <XMarkIcon className="size-8 text-base-text hover:text-base-text-hover" />
        </button>
        <PaneGrid col={diary.colSize} row={diary.rowSize} showGrid={true}>
          {diary.data.map((paneData) => (
            <Pane key={paneData.id} data={paneData} />
          ))}
        </PaneGrid>
      </div>
    ),
  });
}

// 日誌表示コンポーネント
function DiaryDisplay({
  diariesPromise,
}: {
  diariesPromise: Promise<DiaryDBResponse[] | ArkErrors>;
}) {
  const diaries = use(diariesPromise);

  if (diaries instanceof ArkErrors) {
    return <p className="text-danger-text">日誌の取得に失敗しました</p>;
  }

  if (diaries.length === 0) {
    return <p className="text-gray-text">この日の日誌はありません</p>;
  }

  // 1件のみの場合はSwiperを使わない
  if (diaries.length === 1) {
    const diary = diaries[0];
    return (
      <div className="size-full flex flex-col">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <p className="text-sm text-gray-text">
            {diary.templateName ?? "テンプレートなし"}
          </p>
          <Button variant="ghost" onClick={() => showDiaryFullScreen(diary)}>
            <ArrowsPointingOutIcon className="size-5" />
          </Button>
        </div>
        <div className="grow min-h-0">
          <PaneGrid col={diary.colSize} row={diary.rowSize}>
            {diary.data.map((pane: DiaryPaneData) => (
              <Pane key={pane.id} data={pane} />
            ))}
          </PaneGrid>
        </div>
      </div>
    );
  }

  // 複数件の場合はSwiperを使用
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={16}
      slidesPerView={1}
      className="size-full px-24"
    >
      {diaries.map((diary, index) => (
        <SwiperSlide key={diary.id} className="h-auto!">
          <div className="size-full flex flex-col pb-8 px-4">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <p className="text-sm text-gray-text">
                {diary.templateName ?? "テンプレートなし"} ({index + 1}/
                {diaries.length})
              </p>
              <Button
                variant="ghost"
                onClick={() => showDiaryFullScreen(diary)}
              >
                <ArrowsPointingOutIcon className="size-5" />
              </Button>
            </div>
            <div className="grow min-h-0">
              <PaneGrid col={diary.colSize} row={diary.rowSize} showGrid={true}>
                {diary.data.map((pane: DiaryPaneData) => (
                  <Pane key={pane.id} data={pane} />
                ))}
              </PaneGrid>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default function DiaryCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diariesPromise, setDiariesPromise] = useState(() =>
    getDiariesByDate(new Date()),
  );

  // 日付が変更されたらPromiseを更新
  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setDiariesPromise(getDiariesByDate(date));
  }

  // カスタムのクリック可能な日付セル
  function ClickableDayCell({
    year,
    month,
    day,
    isToday,
    isCurrentMonth,
  }: Calendar.CalendarCellProps) {
    const isSelected =
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() + 1 &&
      year === selectedDate.getFullYear();

    return (
      <button
        type="button"
        disabled={isSelected || !isCurrentMonth}
        onClick={() => handleDateSelect(new Date(year, month - 1, day))}
        className={cn("rounded-full transition-colors", {
          "bg-red-400": isToday && !isSelected,
          "bg-blue-500 text-base-text": isSelected,
          "text-gray-text": !isCurrentMonth && !isSelected,
          "hover:bg-stone-700": isCurrentMonth && !isSelected && !isToday,
          "cursor-pointer": isCurrentMonth && !isSelected,
        })}
      >
        {day}
      </button>
    );
  }

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedDay = selectedDate.getDate();

  return (
    <div className="text-base-text size-full flex text-lg">
      <div className="w-96 h-full px-4 pt-16 shrink-0">
        <Calendar.Root>
          <Calendar.Header>
            <Calendar.DateDisplay />
            <Calendar.Control />
          </Calendar.Header>
          <Calendar.Body>
            <Calendar.WeekdaysRow />
            <Calendar.DaysGrid cell={ClickableDayCell} />
          </Calendar.Body>
        </Calendar.Root>
      </div>

      <div className="grow h-full pt-16 px-8 flex flex-col overflow-hidden border-l-2 border-base-dark">
        <h1 className="text-4xl font-bold mb-4 shrink-0">
          {selectedYear}年{selectedMonth}月{selectedDay}日の日誌
        </h1>
        <div className="grow min-h-0">
          <Suspense fallback={<FallBack />}>
            <DiaryDisplay diariesPromise={diariesPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FallBack() {
  return (
    <div className="size-full flex items-center justify-center">
      <LoadingSpin />
    </div>
  );
}
