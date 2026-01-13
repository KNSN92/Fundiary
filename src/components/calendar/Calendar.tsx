import clsx from "clsx";
import { useState } from "react";

interface CalendarDay {
	year: number;
	month: number;
	day: number;
}

/**
 * 指定された年月のカレンダー情報を取得する
 * @param {number} year 年
 * @param {number} month 月 (1-12)
 * @returns {CalendarDay[]} カレンダーの日付情報の配列(7x6=42要素)
 */
function useCalendar(year: number, month: number): CalendarDay[] {
	const firstDayWeekdayInMonth = new Date(year, month - 1, 1).getDay();
	const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
	const daysInMonth = new Date(year, month, 0).getDate();
	44;
	return Array.from(
		{ length: 7 * 6 },
		(_v, k) => k - firstDayWeekdayInMonth + 1,
	).map((v) => {
		if (v <= 0) {
			return {
				year: year - 1,
				month: ((month - 2) % 12) + 1,
				day: daysInPrevMonth + v,
			};
		} else if (daysInMonth < v) {
			return { year: year + 1, month: (month % 12) + 1, day: v - daysInMonth };
		} else {
			return { year, month, day: v };
		}
	});
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Root() {
	const [targetDate, _setTargetDate] = useState(new Date());
	const now = new Date();
	const targetYear = targetDate.getFullYear();
	const targetMonth = targetDate.getMonth() + 1;
	const calendar = useCalendar(
		targetDate.getFullYear(),
		targetDate.getMonth() + 1,
	);

	return (
		<div className="w-full text-lg">
			<div className="pl-2 flex flex-nowrap justify-center gap-8">
				<span className="text-left text-nowrap font-bold text-2xl">
					{targetYear.toString().padStart(4, "0")}
					{" / "}
					{targetMonth.toString().padStart(2, "0")}
				</span>
				<CalendarControl
					targetDate={targetDate}
					setTargetDate={_setTargetDate}
				/>
			</div>
			<div className="mt-2 grid grid-cols-7 grid-rows-7 gap-1">
				{WEEKDAYS.map((day) => (
					<div key={day} className="text-stone-400 font-bold">
						{day}
					</div>
				))}
				{calendar.map(({ year, month, day }) => (
					<CalendarDayCell
						day={day}
						isToday={
							day === now.getDate() &&
							month === now.getMonth() + 1 &&
							year === now.getFullYear()
						}
						isCurrentMonth={month === targetMonth}
						key={(year * 1000 + month) * 100 + day}
					/>
				))}
			</div>
		</div>
	);
}

interface CalendarDayCellProps {
	day: number;
	isCurrentMonth: boolean;
	isToday: boolean;
}

function CalendarDayCell({
	day,
	isCurrentMonth,
	isToday,
}: CalendarDayCellProps) {
	return (
		<div
			className={clsx(
				isToday && "text-red-400",
				!isCurrentMonth && "text-stone-400",
			)}
		>
			{day}
		</div>
	);
}

interface CalendarControlProps {
	targetDate: Date;
	setTargetDate: (date: Date) => void;
}

function CalendarControl({ targetDate, setTargetDate }: CalendarControlProps) {
	const now = new Date();
	const targetYear = targetDate.getFullYear();
	const targetMonth = targetDate.getMonth() + 1;
	const targetDay = targetDate.getDate();
	return (
		<div className="w-full flex justify-end gap-2">
			<button
				type="button"
				onClick={() =>
					setTargetDate(new Date(targetYear, targetMonth - 2, targetDay))
				}
				className="h-full aspect-square rounded-lg cursor-pointer transition bg-base hover:bg-base-dark"
			>
				{"<"}
			</button>
			<button
				type="button"
				onClick={() =>
					setTargetDate(new Date(targetYear, targetMonth, targetDay))
				}
				className="h-full aspect-square rounded-lg cursor-pointer transition bg-base hover:bg-base-dark"
			>
				{">"}
			</button>
			<button
				type="button"
				onClick={() => setTargetDate(now)}
				className="h-full aspect-square rounded-lg enabled:cursor-pointer transition bg-base hover:bg-base-dark disabled:bg-base-dark"
				disabled={
					now.getFullYear() === targetYear &&
					now.getMonth() + 1 === targetMonth &&
					now.getDate() === targetDay
				}
			>
				{"^"}
			</button>
		</div>
	);
}
