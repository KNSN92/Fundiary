import type { ReactNode } from "react";
import { EventEmitter, type Identifier } from "../misc";

interface OnloadEvent {
	name: "onload";
	payload: null;
}

type PageEvents = OnloadEvent;

export class Page {
	id: Identifier;
	component: () => ReactNode;
	events: EventEmitter<PageEvents>;

	constructor(id: Identifier, page: () => ReactNode) {
		this.id = id;
		this.component = page;
		this.events = new EventEmitter<PageEvents>();
	}
}
