import {
	createContext,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

interface Props {
	col: number;
	row: number;
	showGrid?: boolean;
	onClick?: () => void;
	children?: ReactNode;
}

export const EditablePaneGridContext = createContext<null | {
	tileSize: number;
}>(null);

export default function EditablePaneGrid({
	row,
	col,
	showGrid,
	onClick,
	children,
}: Props) {
	const gridWrapperRef = useRef<HTMLDivElement | null>(null);
	const [tileSize, setTileSize] = useState<number>(0);
	useEffect(() => {
		if (gridWrapperRef.current == null) return;
		const gridWrapperElement = gridWrapperRef.current;
		function handleClick(e: MouseEvent) {
			if (
				onClick != null &&
				(gridWrapperElement === e.target ||
					gridWrapperElement.children[0] === e.target)
			) {
				onClick();
			}
		}
		gridWrapperElement.addEventListener("click", handleClick);
		return () => {
			gridWrapperElement.removeEventListener("click", handleClick);
		};
	}, [onClick]);
	useEffect(() => {
		const gridWrapperElement = gridWrapperRef.current;
		if (gridWrapperElement == null) return;
		function updateTileSize() {
			if (gridWrapperElement == null) return;
			setTileSize(
				Math.min(
					Math.floor(gridWrapperElement.clientWidth / col),
					Math.floor(gridWrapperElement.clientHeight / row),
				),
			);
		}
		const resizeObserver = new ResizeObserver(updateTileSize);
		resizeObserver.observe(gridWrapperElement);
		updateTileSize();
		return () => {
			resizeObserver.disconnect();
		};
	}, [row, col]);
	return (
		<div
			ref={gridWrapperRef}
			className="w-full h-full flex justify-center items-center"
		>
			<div
				style={{
					backgroundImage: showGrid
						? `
							linear-gradient(0deg, transparent calc(100% - 1px), #0008 calc(100% - 1px)),
							linear-gradient(90deg, transparent calc(100% - 1px), #0008 calc(100% - 1px))
						`
						: undefined,
					backgroundPosition: showGrid ? "-1px -1px" : undefined,
					backgroundSize: showGrid
						? `${tileSize ?? 0}px ${tileSize ?? 0}px`
						: undefined,
					backgroundRepeat: showGrid ? "repeat" : undefined,
					border: showGrid ? "1px solid #0008" : undefined,
					height: tileSize ? row * tileSize : "100%",

					aspectRatio: `${col} / ${row}`,
				}}
				className="relative"
			>
				<EditablePaneGridContext.Provider value={{ tileSize }}>
					{children}
				</EditablePaneGridContext.Provider>
			</div>
		</div>
	);
}
