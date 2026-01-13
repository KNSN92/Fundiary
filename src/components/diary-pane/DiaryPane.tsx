import { type DiaryPaneData, getDiaryPane } from "@/app/diary-pane";

interface Props {
	data: DiaryPaneData;
}

export default function Pane({ data }: Props) {
	const pane = getDiaryPane(data.pane);
	if (pane == null) {
		throw new Error(`DiaryPane not found: ${data.id}`);
	}
	const { x, y } = data.pos;
	const { width, height } = data.size;
	return (
		<div
			className="overflow-hidden"
			style={{
				gridColumnStart: x + 1,
				gridColumn: `${x + 1} / ${x + width + 1}`,
				gridRowStart: y + 1,
				gridRow: `${y + 1} / ${y + height + 1}`,
			}}
		>
			<pane.component data={data.data} />
		</div>
	);
}
