import clsx from "clsx";
import type { ReactNode } from "react";
import { useSelectedTabIndex, useTabbarItems } from "@/app/tabbar";
import fundiary from "@/fundiary";

export default function Tabbar() {
	const tabbarItems = useTabbarItems();
	const selectedTabIndex = useSelectedTabIndex();

	return (
		<div className="w-full h-16 flex z-10 bg-base">
			{tabbarItems.map((item, i) => (
				<TabbarItem
					selected={selectedTabIndex === i}
					onClick={() =>
						item.events.emit("click", {
							selecting: selectedTabIndex === i,
							toggleSelect: () => {
								if (selectedTabIndex === i) {
									item.events.emit("deselect", {
										new_selected: null,
									});
									fundiary.tabbar.deselect();
									return false;
								} else {
									if (selectedTabIndex != null) {
										tabbarItems[selectedTabIndex].events.emit("deselect", {
											new_selected: tabbarItems[i].id,
										});
									}
									fundiary.tabbar.select(tabbarItems[i].id);
									return true;
								}
							},
						})
					}
					key={item.id}
				>
					{item.element()}
				</TabbarItem>
			))}
		</div>
	);
}

interface TabbarItemProps {
	children: ReactNode;
	onClick: () => void;
	selected: boolean;
}

function TabbarItem({ children, onClick, selected }: TabbarItemProps) {
	return (
		<button
			type="button"
			className={clsx(
				"min-w-16 h-5/4 flex justify-center items-end pointer-events-auto rounded-b-xl bg-base hover:bg-base-dark transition-all cursor-pointer",
				selected && "h-3/2! bg-base-dark",
			)}
			onClick={() => onClick?.()}
		>
			<div className="overflow-hidden aspect-square w-full">{children}</div>
		</button>
	);
}
