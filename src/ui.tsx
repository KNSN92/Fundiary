import "./ui.css";
import useFullscreen from "./app/fullscreen";
import { TabbarProvider } from "./app/tabbar";
import Titlebar from "./components/Titlebar";
import Tabbar from "./components/tabbar/Tabbar";
import fundiary from "./fundiary";

function UI() {
	const isFullscreen = useFullscreen();
	return (
		<div className="flex flex-col pointer-none select-none bg-black w-screen h-screen">
			{!isFullscreen && <Titlebar />}
			<TabbarProvider>
				<Tabbar />
			</TabbarProvider>

			<div className="overflow-hidden pt-8 flex-2 bg-base-bg">
				{fundiary.pages.component()}
			</div>
		</div>
	);
}

export default UI;
