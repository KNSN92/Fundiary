import { type Identifier } from "fundiary-api";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import type { ReactNode } from "react";

export interface Modal {
	id: Identifier;
	bgColor?: string;
	bgClickToClose?: boolean;
	canControlBg?: boolean;
	centered?: boolean;
	render: () => ReactNode;
}

const modalStackAtom = atom<Modal[]>([]);
const stackedModalIdentifiers = new Set<Identifier>();
const store = getDefaultStore();

export class Modals {
	show(modal: Modal) {
		if (stackedModalIdentifiers.has(modal.id)) {
			console.warn(`Modal with id ${modal.id} is already shown in the stack.`);
			return;
		}
		const currentStack = store.get(modalStackAtom);
		store.set(modalStackAtom, [...currentStack, modal]);
		stackedModalIdentifiers.add(modal.id);
	}

	closeThis(id: Identifier) {
		const currentStack = store.get(modalStackAtom);
		if (currentStack.find((m) => m.id === id)) {
			this.close();
		}
	}

	close() {
		const currentStack = store.get(modalStackAtom);
		const poped = currentStack.pop();
		store.set(modalStackAtom, [...currentStack]);
		if (poped) stackedModalIdentifiers.delete(poped.id);
	}

	closeAll() {
		store.set(modalStackAtom, []);
		stackedModalIdentifiers.clear();
	}
}

export function useModal(): Modal | undefined {
	return useAtomValue(modalStackAtom).at(-1);
}
