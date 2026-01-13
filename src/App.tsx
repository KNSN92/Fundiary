import "./App.css";
import useFullscreen from "./app/fullscreen";
import { PageProvider, usePage } from "./app/page";
import Titlebar from "./components/Titlebar";
import Tabbar from "./components/tabbar/Tabbar";

function App() {
	const isFullscreen = useFullscreen();
	return (
		<div className="flex flex-col pointer-none select-none bg-black w-screen h-screen">
			{!isFullscreen && <Titlebar />}
			<Tabbar />
			<div className="overflow-hidden pt-8 flex-2 bg-base-bg">
				<PageProvider>
					<Page />
				</PageProvider>
			</div>
		</div>
	);
}

function Page() {
	const page = usePage();
	return page ? <page.page /> : null;
}

export default App;
