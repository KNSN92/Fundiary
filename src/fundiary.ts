import { TabbarItem } from "fundiary-api";
import { Page } from "fundiary-api/api/page";
import createTextTab from "@/components/tabbar/TextTab";
import DiaryCalendarPage from "@/pages/DiaryCalendarPage";
import DiaryEditPage from "@/pages/DiaryEditPage";
import DiaryListPage from "@/pages/DiaryListPage";
import DiaryWritePage from "@/pages/DiaryWritePage";
import WelcomePage from "@/pages/WelcomePage";
import { DiaryPanes } from "./app/diary-pane";
import imagePane from "./app/diary-pane/image-pane";
import textPane from "./app/diary-pane/text-pane";
import Pages from "./app/page";
import Tabbar from "./app/tabbar";

export interface Fundiary {
	diaryPanes: DiaryPanes;
	pages: Pages;
	tabbar: Tabbar;
}

const fundiary: Fundiary = {
	diaryPanes: new DiaryPanes(),
	pages: new Pages(),
	tabbar: new Tabbar(),
};

export default fundiary;

export function init_fundiary() {
	fundiary.diaryPanes.registry(textPane);
	fundiary.diaryPanes.registry(imagePane);

	fundiary.tabbar
		.register(new TabbarItem("base:home_tab", createTextTab("ホーム")))
		.events.on("click", ({ toggleSelect, selecting }) => {
			if (!selecting && toggleSelect()) {
				fundiary.pages.open("base:welcome_page");
			}
		})
		.on("deselect", () => {
			fundiary.pages.close("base:welcome_page");
		});
	fundiary.tabbar
		.register(
			new TabbarItem("base:diary_list_tab", createTextTab("日誌\n一覧")),
		)
		.events.on("click", ({ toggleSelect }) => {
			if (toggleSelect()) {
				fundiary.pages.open("base:diary_list_page");
			}
		})
		.on("deselect", () => {
			fundiary.pages.open("base:welcome_page");
		});
	fundiary.tabbar
		.register(
			new TabbarItem("base:diary_edit_tab", createTextTab("日誌\n編集")),
		)
		.events.on("click", ({ toggleSelect }) => {
			if (toggleSelect()) {
				fundiary.pages.open("base:diary_edit_page");
			}
		})
		.on("deselect", () => {
			fundiary.pages.open("base:welcome_page");
		});
	fundiary.tabbar
		.register(
			new TabbarItem("base:diary_calendar_tab", createTextTab("カレンダー")),
		)
		.events.on("click", ({ toggleSelect }) => {
			if (toggleSelect()) {
				fundiary.pages.open("base:diary_calendar_page");
			}
		})
		.on("deselect", () => {
			fundiary.pages.open("base:welcome_page");
		});
	fundiary.pages
		.register(new Page("base:welcome_page", WelcomePage))
		.events.on("onload", () => {
			fundiary.tabbar.select("base:home_tab");
		});
	fundiary.pages.register(new Page("base:diary_list_page", DiaryListPage));
	fundiary.pages.register(new Page("base:diary_edit_page", DiaryEditPage));
	fundiary.pages.register(new Page("base:diary_write_page", DiaryWritePage));
	fundiary.pages.register(
		new Page("base:diary_calendar_page", DiaryCalendarPage),
	);

	fundiary.pages.open("base:welcome_page");
}
