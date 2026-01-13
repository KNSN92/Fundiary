import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import type { ReactNode } from "react";

interface Dialog {
	render: () => ReactNode;
}

const dialogStackAtom = atom<Dialog[]>([]);

export function showDialog(dialog: Dialog) {
	const [dialogStack, setDialogStack] = useAtom(dialogStackAtom);
	setDialogStack([...dialogStack, dialog]);
}

export function closeDialog() {
	const [dialogStack, setDialogStack] = useAtom(dialogStackAtom);
	dialogStack.pop();
	setDialogStack([...dialogStack]);
}

export function closeAllDialogs() {
	const setDialogStack = useSetAtom(dialogStackAtom);
	setDialogStack([]);
}

export function useDialog() {
	return useAtomValue(dialogStackAtom).at(-1);
}
