import type { ReactNode } from "react";
import { EventEmitter, type Identifier } from "../misc";

interface OnClickEvent {
	name: "click";
	payload: {
		selecting: boolean;
		toggleSelect: () => boolean;
	};
}

interface OnDeselectEvent {
	name: "deselect";
	payload: {
		new_selected: Identifier | null;
	};
}

type TabbarEvents = OnClickEvent | OnDeselectEvent;

export class TabbarItem {
	id: Identifier;
	element: () => ReactNode;
	events: EventEmitter<TabbarEvents>;

	constructor(id: Identifier, element: () => ReactNode) {
		this.id = id;
		this.element = element;
		this.events = new EventEmitter<TabbarEvents>();
	}
}
