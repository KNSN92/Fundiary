import type { Identifier } from "fundiary-api";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import type { ReactNode } from "react";

export interface Modal {
	/** モーダル固有id。クローズ処理などで参照されます */
	id: Identifier;
	/** 背景色 */
	bgColor?: string;
	/** 背景をクリックして閉じられるか */
	bgClickToClose?: boolean;
	/** モーダルが開いていても背景が操作可能か。bgClickToCloseの動作が無効になります。 */
	canControlBg?: boolean;
	/** モーダルを中央に表示するか */
	centered?: boolean;
	/** モーダルの内容を描画する関数 */
	render: () => ReactNode;
}

const modalStackAtom = atom<Modal[]>([]);
const stackedModalIdentifiers = new Set<Identifier>();
const store = getDefaultStore();

export class Modals {
	/** モーダルを表示します。同じidのモーダルを同時に複数表示させることは出来ません。 */
	show(modal: Modal) {
		if (stackedModalIdentifiers.has(modal.id)) {
			console.warn(`Modal with id ${modal.id} is already shown in the stack.`);
			return;
		}
		const currentStack = store.get(modalStackAtom);
		store.set(modalStackAtom, [...currentStack, modal]);
		stackedModalIdentifiers.add(modal.id);
	}

	/** 指定されたidのモーダルを閉じます。 */
	closeThis(id: Identifier) {
		const currentStack = store.get(modalStackAtom);
		const index = currentStack.findIndex((m) => m.id === id);
		if (index !== -1) {
			const newStack = [...currentStack];
			newStack.splice(index, 1);
			store.set(modalStackAtom, newStack);
			stackedModalIdentifiers.delete(id);
		}
	}

	/** 最前面のモーダルを閉じます */
	close() {
		const currentStack = store.get(modalStackAtom);
		const poped = currentStack.pop();
		store.set(modalStackAtom, [...currentStack]);
		if (poped) stackedModalIdentifiers.delete(poped.id);
	}

	/** 全てのモーダルを閉じます */
	closeAll() {
		store.set(modalStackAtom, []);
		stackedModalIdentifiers.clear();
	}
}

export function useModal(): Modal | undefined {
	return useAtomValue(modalStackAtom).at(-1);
}
