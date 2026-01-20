import type { TabbarItem } from "fundiary-api";
import type { Identifier } from "fundiary-api/misc/identifier";
import { atom, createStore, Provider, useAtomValue } from "jotai";
import type { ReactNode } from "react";

// Jotai atoms - モジュールレベルで定義
const tabbarStore = createStore();
const selectedTabIdAtom = atom<Identifier | null>(null);
const tabbarItemsAtom = atom<TabbarItem[]>([]);

/**
 * TabbarのJotaiストアを提供するProvider
 */
export function TabbarProvider({ children }: { children: ReactNode }) {
	return <Provider store={tabbarStore}>{children}</Provider>;
}

/**
 * 現在選択されているタブのインデックスを取得するフック
 * @returns 選択されているタブのインデックス、未選択の場合はnull
 */
export function useSelectedTabIndex(): number | null {
	const selectedId = useAtomValue(selectedTabIdAtom);
	const items = useAtomValue(tabbarItemsAtom);

	if (selectedId == null) {
		return null;
	}

	const index = items.findIndex((item) => item.id === selectedId);
	return index >= 0 ? index : null;
}

/**
 * 現在選択されているタブのIDを取得するフック
 * @returns 選択されているタブのID、未選択の場合はnull
 */
export function useSelectedTabId(): Identifier | null {
	return useAtomValue(selectedTabIdAtom);
}

/**
 * 登録されているすべてのタブアイテムを取得するフック
 * @returns タブアイテムの配列
 */
export function useTabbarItems(): TabbarItem[] {
	return useAtomValue(tabbarItemsAtom);
}

/**
 * Tabbarの管理クラス
 * fundiary.tabbarからタブの登録・選択などの操作を行う
 */
export default class Tabbar {
	register(item: TabbarItem): TabbarItem {
		tabbarStore.set(tabbarItemsAtom, (prev) => [...prev, item]);
		return item;
	}

	unregister(id: Identifier): void {
		tabbarStore.set(tabbarItemsAtom, (prev) =>
			prev.filter((item) => item.id !== id),
		);
	}

	unregisterAll(): void {
		tabbarStore.set(tabbarItemsAtom, []);
	}

	getAll(): TabbarItem[] {
		return tabbarStore.get(tabbarItemsAtom);
	}

	get(id: Identifier): TabbarItem | undefined {
		return tabbarStore.get(tabbarItemsAtom).find((item) => item.id === id);
	}

	select(id: Identifier): void {
		tabbarStore.set(selectedTabIdAtom, id);
	}

	deselect(): void {
		tabbarStore.set(selectedTabIdAtom, null);
	}

	getSelectedId(): Identifier | null {
		return tabbarStore.get(selectedTabIdAtom);
	}
}
