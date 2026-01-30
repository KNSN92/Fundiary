import clsx from "clsx";
import {
	createContext,
	type ReactElement,
	type ReactNode,
	useContext,
	useState,
} from "react";

interface CalendarDay {
	year: number;
	month: number;
	day: number;
}

// Context の型定義
interface CalendarContextValue {
	targetDate: Date;
	setTargetDate: (date: Date) => void;
	now: Date;
	targetYear: number;
	targetMonth: number;
	targetDay: number;
	calendar: CalendarDay[];
}

// Context の作成
const CalendarContext = createContext<CalendarContextValue | null>(null);

// Context を使用するための Hook
export function useCalendarContext(): CalendarContextValue {
	const context = useContext(CalendarContext);
	if (!context) {
		throw new Error(
			"useCalendarContext must be used within a CalendarProvider",
		);
	}
	return context;
}

/**
 * 指定された年月のカレンダー情報を取得する
 * @param {number} year 年
 * @param {number} month 月 (1-12)
 * @returns {CalendarDay[]} カレンダーの日付情報の配列(7x6=42要素)
 */
function getCalendarDays(year: number, month: number): CalendarDay[] {
	const firstDayWeekdayInMonth = new Date(year, month - 1, 1).getDay();
	const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
	const daysInMonth = new Date(year, month, 0).getDate();

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

export interface CalendarCellProps {
	year: number;
	month: number;
	day: number;
	isToday: boolean;
	isCurrentMonth: boolean;
	key: number;
}

// Provider コンポーネント
function Provider({ children }: { children: ReactNode }) {
	const [targetDate, setTargetDate] = useState(new Date());
	const now = new Date();
	const targetYear = targetDate.getFullYear();
	const targetMonth = targetDate.getMonth() + 1;
	const targetDay = targetDate.getDate();
	const calendar = getCalendarDays(targetYear, targetMonth);

	return (
		<CalendarContext.Provider
			value={{
				targetDate,
				setTargetDate,
				now,
				targetYear,
				targetMonth,
				targetDay,
				calendar,
			}}
		>
			{children}
		</CalendarContext.Provider>
	);
}

// 日付表示コンポーネント
export function DateDisplay() {
	const { targetYear, targetMonth } = useCalendarContext();
	return (
		<span className="text-left text-nowrap font-bold text-2xl">
			{targetYear.toString().padStart(4, "0")}
			{" / "}
			{targetMonth.toString().padStart(2, "0")}
		</span>
	);
}

export function Header({ children }: { children: ReactNode }) {
	return (
		<div className="pl-2 flex flex-nowrap justify-center gap-8">{children}</div>
	);
}

export function Body({ children }: { children: ReactNode }) {
	return (
		<div className="mt-2 grid grid-cols-7 grid-rows-7 gap-1">{children}</div>
	);
}

// 曜日行コンポーネント
export function WeekdaysRow() {
	return (
		<>
			{WEEKDAYS.map((day) => (
				<div key={day} className="text-stone-400 font-bold">
					{day}
				</div>
			))}
		</>
	);
}

// 日付グリッドコンポーネント
export function DaysGrid({
	cell: Cell = CalendarDayCell,
}: {
	cell?: (props: CalendarCellProps) => ReactElement;
}) {
	const { now, targetMonth, calendar } = useCalendarContext();

	return (
		<>
			{calendar.map(({ year, month, day }) => (
				<Cell
					year={year}
					month={month}
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
		</>
	);
}

export function Root({ children }: { children: ReactNode }) {
	return (
		<div className="w-full text-lg">
			<Provider>{children}</Provider>
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
				"rounded-full",
				isToday && "bg-red-400",
				!isCurrentMonth && "text-stone-400",
			)}
		>
			{day}
		</div>
	);
}

// カレンダーコントロールコンポーネント
export function Control() {
	const { setTargetDate, now, targetYear, targetMonth, targetDay } =
		useCalendarContext();

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
