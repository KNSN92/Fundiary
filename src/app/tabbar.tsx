import { EventEmitter } from "fundiary-api";
import type { Identifier } from "fundiary-api/misc/identifier";
import type { ReactNode } from "react";
import { closePage, openPage } from "./page";
import { atom, createStore, useAtomValue, Provider } from "jotai";

const tabbarItemId2Index = new Map<Identifier, number>();
const tabbarItems: TabbarItem[] = [];
const selectedTab = atom<Identifier | null>(null);
const tabbarStore = createStore();
export function TabbarProvider({ children }: { children: ReactNode }) {
  return <Provider store={tabbarStore}>{children}</Provider>;
}

export function registerTabbarItem(item: TabbarItem) {
  Object.freeze(item);
  tabbarItemId2Index.set(item.id, tabbarItems.length);
  tabbarItems.push(item);
  return item;
}

export function unregisterAllTabbarItems() {
  tabbarItems.length = 0;
  tabbarItemId2Index.clear();
}

export function selectTab(id: Identifier) {
  tabbarStore.set(selectedTab, id);
}

export function deselectTab() {
  tabbarStore.set(selectedTab, null);
}

export function useSelectedTab(): number | null {
  const selectedId = useAtomValue(selectedTab);
  if (selectedId == null) {
    return null;
  }
  return tabbarItemId2Index.get(selectedId) ?? null;
}

export function useTabbar() {
  return [...tabbarItems];
}

interface OnClickEvent {
  name: "click";
  payload: {
    selecting: boolean;
    toggleSelect: () => boolean;
  };
}

interface OnDeselectEvent {
  name: "deselect";
  payload: {
    new_selected: Identifier | null;
  };
}

type TabbarEvents = OnClickEvent | OnDeselectEvent;

export class TabbarItem {
  id: Identifier;
  element: () => ReactNode;
  events: EventEmitter<TabbarEvents>;

  constructor(
    id: Identifier,
    element: () => ReactNode,
    page_connection?: Identifier
  ) {
    this.id = id;
    this.element = element;
    this.events = new EventEmitter<TabbarEvents>();
    if (page_connection == null) return;
    this.events.on("click", (e) => {
      if (e.toggleSelect()) {
        openPage(page_connection);
      } else {
        closePage(page_connection);
      }
    });
  }
}
