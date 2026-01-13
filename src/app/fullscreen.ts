import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

const $is_fullscreen = atom(await getCurrentWindow().isFullscreen());

listen("tauri://resize", async () => {
	$is_fullscreen.set(await getCurrentWindow().isFullscreen());
});

export default function useFullscreen() {
	return useStore($is_fullscreen);
}
