import { EventEmitter, type Identifier, id } from "fundiary-api";
import { atom, createStore, Provider, useAtomValue } from "jotai";
import { type ReactNode, useEffect } from "react";

const pages = new Map<Identifier, Page>();

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
const store = createStore();
export const PageProvider = ({ children }: { children: ReactNode }) => (
	<Provider store={store}>{children}</Provider>
);

export interface PagePayload {
	kind: string;
	data: unknown;
}

export function registerPage(plugin_id: string, page: Page) {
	Object.freeze(page);
	pages.set(id(plugin_id, page.id), page);
	return page;
}

export function unregisterAllPages() {
	pages.clear();
}

export function openPage(
	id: Identifier,
	payload?: { kind: string; data: unknown },
) {
	if (!pages.has(id)) throw new Error(`Page not found: ${id}`);
	store.set(openingPageData, (prev) => ({
		openingPage: id,
		openingPagePayload: payload ?? null,
		prevPage: prev.openingPage,
	}));
}

export function closePage(id?: Identifier) {
	if (id && store.get(openingPageData).openingPage !== id) {
		return;
	}
	store.set(openingPageData, () => ({
		openingPage: null,
		openingPagePayload: null,
		prevPage: null,
	}));
}

export function usePage() {
	const { openingPage } = useAtomValue(openingPageData);
	const page = openingPage ? (pages.get(openingPage) ?? null) : null;
	useEffect(() => {
		page?.events.emit("onload", null);
	}, [page]);
	if (!openingPage) {
		return null;
	}
	if (!page) {
		throw new Error(`Page not found: ${openingPage}`);
	}
	return page;
}

export function usePagePayload(kind: string): unknown {
	const { openingPagePayload } = useAtomValue(openingPageData);
	if (openingPagePayload == null || openingPagePayload.kind !== kind) {
		return null;
	}
	return openingPagePayload.data;
}

interface OnloadEvent {
	name: "onload";
	payload: null;
}

type PageEvents = OnloadEvent;

export class Page {
	id: string;
	page: () => ReactNode;
	events: EventEmitter<PageEvents>;

	constructor(id: string, page: () => ReactNode) {
		this.id = id;
		this.page = page;
		this.events = new EventEmitter<PageEvents>();
	}
}
