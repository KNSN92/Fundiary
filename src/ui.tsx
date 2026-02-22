import "./ui.css";
import useFullscreen from "./app/fullscreen";
import { TabbarProvider } from "./app/tabbar";
import ModalRoot from "./components/modal/Modal";
import Titlebar from "./components/titlebar/Titlebar";
import Tabbar from "./components/tabbar/Tabbar";
import fundiary from "./fundiary";

function UI() {
  const isFullscreen = useFullscreen();
  return (
    <div className="flex flex-col pointer-none select-none bg-black w-screen h-screen">
      <ModalRoot />
      {!isFullscreen && <Titlebar />}
      <TabbarProvider>
        <Tabbar />
      </TabbarProvider>
      <div className="overflow-hidden flex-2 bg-base-bg">
        <fundiary.pages.component />
      </div>
    </div>
  );
}

export default UI;
