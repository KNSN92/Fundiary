import type { ReactNode } from "react";

export default function createTextTab(name: string) {
	const brName = name.split("\n").reduce((acc, v, i, arr) => {
		acc.push(v);
		// biome-ignore lint: lint/suspicious/noArrayIndexKey
		if (i < arr.length - 1) acc.push(<br key={i} />);
		return acc;
	}, [] as ReactNode[]);
	return () => (
		<div className="size-full flex items-center justify-center text-xl text-stone-200 text-center">
			{brName}
		</div>
	);
}
