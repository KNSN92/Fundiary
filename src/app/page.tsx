import type { Identifier } from "fundiary-api";
import type { Page } from "fundiary-api/api/page";
import { atom, createStore, Provider, useAtomValue } from "jotai";
import { useEffect } from "react";

export interface PagePayload {
	kind: string;
	data: unknown;
}

interface OpeningPageData {
	openingPage: Identifier | null;
	openingPagePayload: PagePayload | null;
	prevPage: Identifier | null;
}

const openingPageData = atom<OpeningPageData>({
	openingPage: null,
	openingPagePayload: null,
	prevPage: null,
});

export default class Pages {
	#pages = new Map<Identifier, Page>();
	#pageStore = createStore();

	register(page: Page) {
		this.#pages.set(page.id, page);
		return page;
	}

	unregister(identifier: Identifier) {
		this.#pages.delete(identifier);
	}

	get(identifier: Identifier): Page | null {
		return this.#pages.get(identifier) ?? null;
	}

	open(id: Identifier, payload?: { kind: string; data: unknown }) {
		if (!this.#pages.has(id)) throw new Error(`Page not found: ${id}`);
		this.#pageStore.set(openingPageData, (prev) => ({
			openingPage: id,
			openingPagePayload: payload ?? null,
			prevPage: prev.openingPage,
		}));
	}

	close(id?: Identifier) {
		if (id && this.#pageStore.get(openingPageData).openingPage !== id) {
			return;
		}
		this.#pageStore.set(openingPageData, () => ({
			openingPage: null,
			openingPagePayload: null,
			prevPage: null,
		}));
	}

	component() {
		const Inner = () => {
			const { openingPage } = useAtomValue(openingPageData, {
				store: this.#pageStore,
			});
			const page = openingPage && this.get(openingPage);
			useEffect(() => {
				page?.events.emit("onload", null);
			}, [page]);
			if (openingPage == null) {
				return null;
			}
			if (!page) {
				throw new Error(`Page not found: ${openingPage}`);
			}
			return <page.component />;
		};
		return (
			<Provider store={this.#pageStore}>
				<Inner />
			</Provider>
		);
	}
}

export function usePagePayload(kind: string): unknown {
	const { openingPagePayload } = useAtomValue(openingPageData);
	if (openingPagePayload == null || openingPagePayload.kind !== kind) {
		return null;
	}
	return openingPagePayload.data;
}
