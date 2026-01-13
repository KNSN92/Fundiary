export interface EventModel {
	name: string;
	payload: unknown;
}

export class EventEmitter<E extends EventModel> {
	#listeners: {
		[K in E["name"]]?: Array<
			(payload: Extract<E, { name: K }>["payload"]) => void
		>;
	} = {};

	on<K extends E["name"]>(
		eventName: K,
		listener: (payload: Extract<E, { name: K }>["payload"]) => void,
	): this {
		if (!this.#listeners[eventName]) {
			this.#listeners[eventName] = [];
		}
		this.#listeners[eventName]?.push(listener);
		return this;
	}

	off<K extends E["name"]>(
		eventName: K,
		listener: (payload: Extract<E, { name: K }>["payload"]) => void,
	): this {
		const listeners = this.#listeners[eventName];
		if (listeners) {
			this.#listeners[eventName] = listeners.filter((l) => l !== listener);
		}
		return this;
	}

	emit<K extends E["name"]>(
		eventName: K,
		payload: Extract<E, { name: K }>["payload"],
	): void {
		const listeners = this.#listeners[eventName];
		if (listeners) {
			listeners.forEach((listener) => {
				listener(payload);
			});
		}
	}
}
