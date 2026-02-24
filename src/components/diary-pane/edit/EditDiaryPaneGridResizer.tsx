import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

interface Props {
  canResize: { col: boolean; row: boolean };
  size: { col: number; row: number };
  maxSize?: number;
  setSize: (size: { col: number; row: number }) => void;
}

export default function EditDiaryPaneGridResizer({
  canResize,
  size,
  maxSize,
  setSize,
}: Props) {
  return (
    <div className="size-24 aspect-square grid grid-cols-[fit-content(50%)_fit-content(50%)_30%] grid-rows-[30%_fit-content(50%)_fit-content(50%)]">
      <button
        type="button"
        disabled={!canResize.col || size.col <= 1}
        onClick={() =>
          setSize({ col: Math.max(1, size.col - 1), row: size.row })
        }
        className="group h-full aspect-square col-start-1 flex items-center justify-center rouded-full enabled:cursor-pointer"
      >
        <MinusCircleIcon className="size-full group-enabled:group-hover:brightness-80 group-enabled:fill-white group-disabled:fill-red-500" />
      </button>
      <button
        type="button"
        onClick={() =>
          setSize({
            col: Math.min(maxSize ?? Infinity, size.col + 1),
            row: size.row,
          })
        }
        disabled={size.col >= (maxSize ?? Infinity)}
        className="group h-full aspect-square col-start-2 flex items-center justify-center rouded-full enabled:cursor-pointer"
      >
        <PlusCircleIcon className="size-full group-enabled:group-hover:brightness-80 group-enabled:fill-white group-disabled:fill-red-500" />
      </button>
      <button
        type="button"
        onClick={() =>
          setSize({
            col: size.col,
            row: Math.min(maxSize ?? Infinity, size.row + 1),
          })
        }
        disabled={size.row >= (maxSize ?? Infinity)}
        className="group w-full aspect-square row-start-2 col-start-3 flex items-center justify-center rouded-full enabled:cursor-pointer"
      >
        <PlusCircleIcon className="size-full group-enabled:group-hover:brightness-80 group-enabled:fill-white group-disabled:fill-red-500" />
      </button>
      <button
        type="button"
        disabled={!canResize.row || size.row <= 1}
        onClick={() =>
          setSize({ col: size.col, row: Math.max(1, size.row - 1) })
        }
        className="group w-full aspect-square row-start-3 col-start-3 flex items-center justify-center rouded-full enabled:cursor-pointer"
      >
        <MinusCircleIcon className="size-full group-enabled:group-hover:brightness-80 group-enabled:fill-white group-disabled:fill-red-500" />
      </button>
      <div className="min-w-16 size-full p-2 aspect-square row-start-2 row-span-2 col-span-2 flex items-center justify-center bg-base text-xl text-base-text font-mono">
        <span>{size.col}</span>
        <span>x</span>
        <span>{size.row}</span>
      </div>
    </div>
  );
}
