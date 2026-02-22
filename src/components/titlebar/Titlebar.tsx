import { useSelectedTabId } from "@/app/tabbar";
import getTabColor from "@/libs/tab-color";
import clsx from "clsx";

export default function Titlebar() {
  const tabId = useSelectedTabId();
  const color = tabId ? getTabColor(tabId).dark : null;
  return (
    <div
      className={clsx("pointer-none w-full h-7", !color && "bg-base-dark")}
      style={{
        backgroundColor: color ?? undefined,
      }}
      data-tauri-drag-region
    />
  );
}
