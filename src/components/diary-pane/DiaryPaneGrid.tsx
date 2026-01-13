import clsx from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";

interface Props {
	col: number;
	row: number;
	showGrid?: boolean;
	className?: string;
	children?: ReactNode;
}

export default function PaneGrid({
	row,
	col,
	showGrid,
	className,
	children,
}: Props) {
	const gridWrapperRef = useRef<HTMLDivElement>(null);
	const [sizeClass, setSizeClass] = useState("");
	useEffect(() => {
		function updateSizeClass() {
			if (!gridWrapperRef.current) return;
			if (
				gridWrapperRef.current.clientWidth / col <
				gridWrapperRef.current.clientHeight / row
			) {
				setSizeClass("w-full");
			} else {
				setSizeClass("h-full");
			}
		}
		updateSizeClass();
		addEventListener("resize", updateSizeClass);
		return () => {
			removeEventListener("resize", updateSizeClass);
		};
	}, [row, col]);
	return (
		<div
			ref={gridWrapperRef}
			className="size-full flex justify-center items-center"
		>
			<div
				className={clsx(sizeClass, "grid", className, showGrid && "*:border")}
				style={{
					gridTemplateColumns: `repeat(${col}, 1fr)`,
					gridTemplateRows: `repeat(${row}, 1fr)`,
					aspectRatio: `${col} / ${row}`,
				}}
			>
				{children}
			</div>
		</div>
	);
}
