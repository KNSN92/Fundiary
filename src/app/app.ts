import createTextTab from "@/components/tabbar/TextTab";
import DiaryEditPage from "@/pages/DiaryEditPage";
import DiaryListPage from "@/pages/DiaryListPage";
import DiaryWritePage from "@/pages/DiaryWritePage";
import WelcomePage from "@/pages/WelcomePage";
import { registerDiaryPane } from "./diary-pane";
import textPane from "./diary-pane/text-pane";
import { closePage, openPage, Page, registerPage } from "./page";
import { registerTabbarItem, selectTab, TabbarItem } from "./tabbar";

export default function main() {
	registerDiaryPane(textPane);

	registerTabbarItem(new TabbarItem("base:home_tab", createTextTab("ホーム")))
		.events.on("click", ({ toggleSelect, selecting }) => {
			if (!selecting && toggleSelect()) {
				openPage("base:welcome_page");
			}
		})
		.on("deselect", () => {
			closePage("base:welcome_page");
		});
	registerTabbarItem(
		new TabbarItem("base:diary_list_tab", createTextTab("日誌\n一覧")),
	)
		.events.on("click", ({ toggleSelect }) => {
			if (toggleSelect()) {
				openPage("base:diary_list_page");
			}
		})
		.on("deselect", () => {
			openPage("base:welcome_page");
		});
	registerTabbarItem(
		new TabbarItem("base:diary_edit_tab", createTextTab("日誌\n編集")),
	)
		.events.on("click", ({ toggleSelect }) => {
			if (toggleSelect()) {
				openPage("base:diary_edit_page");
			}
		})
		.on("deselect", () => {
			openPage("base:welcome_page");
		});
	// registerTabbarItem(
	// 	new TabbarItem("base:diary_write_tab", createTextTab("日誌\n作成")),
	// )
	// 	.events.on("click", ({ toggleSelect }) => {
	// 		if (toggleSelect()) {
	// 			openPage("base:diary_write_page");
	// 		}
	// 	})
	// 	.on("deselect", () => {
	// 		openPage("base:welcome_page");
	// 	});
	registerPage("base", new Page("welcome_page", WelcomePage)).events.on(
		"onload",
		() => {
			selectTab("base:home_tab");
		},
	);
	registerPage("base", new Page("diary_list_page", DiaryListPage));
	registerPage("base", new Page("diary_edit_page", DiaryEditPage));
	registerPage("base", new Page("diary_write_page", DiaryWritePage));

	openPage("base:welcome_page");
}
