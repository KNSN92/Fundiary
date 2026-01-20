import type { DiaryPane, Identifier } from "fundiary-api";

export class DiaryPanes {
	#diaryPanes = new Map<Identifier, DiaryPane<unknown>>();

	registry<T>(pane: DiaryPane<T>) {
		this.#diaryPanes.set(pane.identifier, pane as DiaryPane<unknown>);
	}

	unregistry(identifier: Identifier) {
		this.#diaryPanes.delete(identifier);
	}

	get(identifier: Identifier): DiaryPane<unknown> | undefined {
		return this.#diaryPanes.get(identifier);
	}

	getAll(): DiaryPane<unknown>[] {
		return [...this.#diaryPanes.values()];
	}
}
