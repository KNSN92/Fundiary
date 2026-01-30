import { type ReactNode, useEffect, useRef, useState } from "react";
import { match } from "ts-pattern";
import cn from "@/libs/cn";

interface Props {
	col: number;
	row: number;
	showGrid?: boolean;
	align?: {
		x: "left" | "center" | "right";
		y: "top" | "center" | "bottom";
	};
	className?: string;
	children?: ReactNode;
}

export default function PaneGrid({
	row,
	col,
	showGrid,
	align,
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
	const alignX = match(align?.x)
		.with("left", () => "items-start")
		.with("center", () => "items-center")
		.with("right", () => "items-end")
		.otherwise(() => "items-center");
	const alignY = match(align?.y)
		.with("top", () => "justify-start")
		.with("center", () => "items-center")
		.with("bottom", () => "justify-end")
		.otherwise(() => "justify-center");
	return (
		<div ref={gridWrapperRef} className={cn("size-full flex", alignX, alignY)}>
			<div
				className={cn(sizeClass, "grid", className, showGrid && "*:border")}
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
