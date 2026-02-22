import type { Identifier } from "fundiary-api";
import type { Page } from "fundiary-api/api/page";
import { atom, getDefaultStore, Provider, useAtomValue } from "jotai";
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

const store = getDefaultStore();

const openingPageData = atom<OpeningPageData>({
  openingPage: null,
  openingPagePayload: null,
  prevPage: null,
});

export default class Pages {
  #pages = new Map<Identifier, Page>();

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
    store.set(openingPageData, (prev) => ({
      openingPage: id,
      openingPagePayload: payload ?? null,
      prevPage: prev.openingPage,
    }));
  }

  close(id?: Identifier) {
    if (id && store.get(openingPageData).openingPage !== id) {
      return;
    }
    store.set(openingPageData, () => ({
      openingPage: null,
      openingPagePayload: null,
      prevPage: null,
    }));
  }
}

export function usePagePayload(): PagePayload | null {
  const { openingPagePayload } = useAtomValue(openingPageData);
  return openingPagePayload;
}

export function PageComponent({ pages }: { pages: Pages }) {
  const Inner = () => {
    const { openingPage } = useAtomValue(openingPageData, {
      store: store,
    });
    const page = openingPage && pages.get(openingPage);
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
    <Provider store={store}>
      <Inner />
    </Provider>
  );
}
