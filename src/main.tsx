import React from "react";
import ReactDOM from "react-dom/client";
import UI from "./ui";
import { initFundiary } from "./fundiary";

initFundiary();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UI />
  </React.StrictMode>,
);
