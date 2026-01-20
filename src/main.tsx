import React from "react";
import ReactDOM from "react-dom/client";
import { init_fundiary } from "./fundiary";
import UI from "./ui";

init_fundiary();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<UI />
	</React.StrictMode>,
);
