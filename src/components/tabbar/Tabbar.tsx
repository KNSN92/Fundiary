import type { ReactNode } from "react";
import { useSelectedTabIndex, useTabbarItems } from "@/app/tabbar";
import fundiary from "@/fundiary";
import cn from "@/libs/cn";
import getTabColor from "@/libs/tab-color";
import type { TabbarItem as TabbarItemType } from "fundiary-api/api/tabbar";
import { Identifier } from "fundiary-api";

export default function Tabbar() {
  const tabbarItems = useTabbarItems();
  const selectedTabIndex = useSelectedTabIndex();

  function onTabbarItemClick(item: TabbarItemType, tabbarIndex: number) {
    item.events.emit("click", {
      selecting: selectedTabIndex === tabbarIndex,
      toggleSelect: () => {
        if (selectedTabIndex === tabbarIndex) {
          item.events.emit("deselect", {
            new_selected: null,
          });
          fundiary.tabbar.deselect();
          return false;
        } else {
          if (selectedTabIndex != null) {
            tabbarItems[selectedTabIndex].events.emit("deselect", {
              new_selected: tabbarItems[tabbarIndex].id,
            });
          }
          fundiary.tabbar.select(tabbarItems[tabbarIndex].id);
          return true;
        }
      },
    });
  }

  return (
    <div className="w-full h-16 flex z-10 bg-base box-content border-collapse border-b-2 border-base-dark">
      {tabbarItems.map((item, i) => (
        <TabbarItem
          selected={selectedTabIndex === i}
          onClick={() => onTabbarItemClick(item, i)}
          key={item.id}
          tabId={item.id}
        >
          <item.element />
        </TabbarItem>
      ))}
    </div>
  );
}

interface TabbarItemProps {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
  tabId: Identifier;
}

function TabbarItem({ children, onClick, selected, tabId }: TabbarItemProps) {
  const color = getTabColor(tabId);

  return (
    <button
      type="button"
      className={cn(
        "min-w-16 h-5/4 flex justify-center items-end pointer-events-auto rounded-b-xl transition-all cursor-pointer",
        selected && "h-3/2!",
      )}
      style={{
        backgroundColor: selected ? color.dark : color.bg,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = color.dark;
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = color.bg;
        }
      }}
      onClick={() => onClick?.()}
    >
      <div className="overflow-hidden aspect-square w-full">{children}</div>
    </button>
  );
}
