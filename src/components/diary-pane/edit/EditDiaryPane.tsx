import type { DiaryPaneData } from "fundiary-api/api/diary-pane";
import { useContext } from "react";
import { Rnd } from "react-rnd";
import fundiary from "@/fundiary";
import { EditablePaneGridContext } from "./EditDiaryPaneGrid";

interface Props {
	data: DiaryPaneData;
	setData: (data: DiaryPaneData) => void;
	focused?: boolean;
	onClick?: () => void;
}

export default function EditablePane({
	data,
	setData,
	focused,
	onClick,
}: Props) {
	const pane = fundiary.diaryPanes.get(data.pane);
	const context = useContext(EditablePaneGridContext);
	if (pane == null) {
		throw new Error(`DiaryPane not found: ${data.id}`);
	}
	if (context == null) {
		throw new Error(
			"EditablePane must be used within an EditablePaneGridContext",
		);
	}
	const tileSize = context.tileSize;
	let minWidth: number;
	let minHeight: number;
	let maxWidth: number | undefined;
	let maxHeight: number | undefined;
	if (pane.resize == null) {
		minWidth = tileSize;
		minHeight = tileSize;
		maxWidth = tileSize;
		maxHeight = tileSize;
	} else {
		minWidth = pane.resize.minSize
			? pane.resize.minSize.width * tileSize
			: tileSize;
		minHeight = pane.resize.minSize
			? pane.resize.minSize.height * tileSize
			: tileSize;
		maxWidth = pane.resize.maxSize
			? pane.resize.maxSize.width * tileSize
			: undefined;
		maxHeight = pane.resize.maxSize
			? pane.resize.maxSize.height * tileSize
			: undefined;
	}
	return (
		<Rnd
			disableDragging={context.tileSize <= 0}
			enableResizing={pane.resize != null}
			bounds={"parent"}
			dragGrid={[tileSize, tileSize]}
			resizeGrid={[tileSize, tileSize]}
			position={{
				x: data.pos.x * tileSize,
				y: data.pos.y * tileSize,
			}}
			size={{
				width: data.size.width * tileSize,
				height: data.size.height * tileSize,
			}}
			minWidth={minWidth}
			minHeight={minHeight}
			maxWidth={maxWidth}
			maxHeight={maxHeight}
			lockAspectRatio={pane.resize?.keepAspectRatio ?? false}
			onDragStop={(_e, d) => {
				const pos = {
					x: Math.round(d.x / tileSize),
					y: Math.round(d.y / tileSize),
				};
				setData({ ...data, pos });
			}}
			onResizeStop={(_e, _dir, _ele, delta, raw_pos) => {
				const pos = {
					x: Math.round(raw_pos.x / tileSize),
					y: Math.round(raw_pos.y / tileSize),
				};
				const size = {
					width: data.size.width + Math.round(delta.width / tileSize),
					height: data.size.height + Math.round(delta.height / tileSize),
				};
				setData({ ...data, pos, size });
			}}
			onMouseDown={onClick}
			className={"relative border border-white overflow-hidden"}
		>
			{focused && (
				<div className="absolute inset-0 size-full bg-transparent border-4 border-red-400" />
			)}
			<pane.component data={data.data} />
		</Rnd>
	);
}
