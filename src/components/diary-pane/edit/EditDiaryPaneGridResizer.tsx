import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

interface Props {
	canResize: { col: boolean; row: boolean };
	size: { col: number; row: number };
	setSize: (size: { col: number; row: number }) => void;
}

export default function EditDiaryPaneGridResizer({
	canResize,
	size,
	setSize,
}: Props) {
	return (
		<div className="size-24 aspect-square grid grid-cols-[fit-content(50%)_fit-content(50%)_30%] grid-rows-[30%_fit-content(50%)_fit-content(50%)]">
			<button
				type="button"
				disabled={!canResize.col}
				onClick={() =>
					setSize({ col: Math.max(1, size.col - 1), row: size.row })
				}
				className={clsx(
					"h-full aspect-square col-start-1 flex items-center justify-center rouded-full group",
					canResize.col && "cursor-pointer",
				)}
			>
				<MinusCircleIcon
					className={clsx(
						"size-full",
						canResize.col ? "group-hover:brightness-80" : "fill-red-500",
					)}
				/>
			</button>
			<button
				type="button"
				onClick={() => setSize({ col: size.col + 1, row: size.row })}
				className="h-full aspect-square col-start-2 flex items-center justify-center rouded-full cursor-pointer group"
			>
				<PlusCircleIcon className="size-full group-hover:brightness-80" />
			</button>
			<button
				type="button"
				onClick={() => setSize({ col: size.col, row: size.row + 1 })}
				className="w-full aspect-square row-start-2 col-start-3 flex items-center justify-center rouded-full cursor-pointer group"
			>
				<PlusCircleIcon className="size-full group-hover:brightness-80" />
			</button>
			<button
				type="button"
				disabled={!canResize.row}
				onClick={() =>
					setSize({ col: size.col, row: Math.max(1, size.row - 1) })
				}
				className={clsx(
					"w-full aspect-square row-start-3 col-start-3 flex items-center justify-center rouded-full group",
					canResize.row && "cursor-pointer",
				)}
			>
				<MinusCircleIcon
					className={clsx(
						"size-full",
						canResize.row ? "group-hover:brightness-80" : "fill-red-500",
					)}
				/>
			</button>
			<div className="min-w-16 size-full p-2 aspect-square row-start-2 row-span-2 col-span-2 flex items-center justify-center bg-black text-xl font-mono">
				<span>{size.col}</span>
				<span>x</span>
				<span>{size.row}</span>
			</div>
		</div>
	);
}
