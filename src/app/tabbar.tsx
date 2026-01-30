import type { TabbarItem } from "fundiary-api";
import type { Identifier } from "fundiary-api/misc/identifier";
import { atom, getDefaultStore, Provider, useAtomValue } from "jotai";
import type { ReactNode } from "react";

const store = getDefaultStore();

// Jotai atoms - モジュールレベルで定義
const selectedTabIdAtom = atom<Identifier | null>(null);
const tabbarItemsAtom = atom<TabbarItem[]>([]);

/**
 * TabbarのJotaiストアを提供するProvider
 */
export function TabbarProvider({ children }: { children: ReactNode }) {
	return <Provider store={store}>{children}</Provider>;
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
		store.set(tabbarItemsAtom, (prev) => [...prev, item]);
		return item;
	}

	unregister(id: Identifier): void {
		store.set(tabbarItemsAtom, (prev) => prev.filter((item) => item.id !== id));
	}

	unregisterAll(): void {
		store.set(tabbarItemsAtom, []);
	}

	getAll(): TabbarItem[] {
		return store.get(tabbarItemsAtom);
	}

	get(id: Identifier): TabbarItem | undefined {
		return store.get(tabbarItemsAtom).find((item) => item.id === id);
	}

	select(id: Identifier): void {
		store.set(selectedTabIdAtom, id);
	}

	deselect(): void {
		store.set(selectedTabIdAtom, null);
	}

	getSelectedId(): Identifier | null {
		return store.get(selectedTabIdAtom);
	}
}
