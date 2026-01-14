import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { atom, getDefaultStore, useAtomValue } from "jotai";

const $isFullscreen = atom(await getCurrentWindow().isFullscreen());

listen("tauri://resize", async () => {
	const isFullscreen = await getCurrentWindow().isFullscreen();
	getDefaultStore().set($isFullscreen, isFullscreen);
});

export default function useFullscreen() {
	return useAtomValue($isFullscreen);
}
