import type { Identifier } from "fundiary-api/misc";

const TAB_COLORS = [
	{ bg: "#7965C1", dark: "#5D4BA3" }, // 紫（ベースカラー）
	{ bg: "#E57373", dark: "#C75050" }, // コーラルレッド
	{ bg: "#64B5F6", dark: "#4A9AD9" }, // スカイブルー
	{ bg: "#81C784", dark: "#5FAF62" }, // ミントグリーン
	{ bg: "#FFB74D", dark: "#E09A30" }, // マンゴーオレンジ
	{ bg: "#BA68C8", dark: "#9A4DAB" }, // ラベンダー
	{ bg: "#4DD0E1", dark: "#35B3C4" }, // ターコイズ
	{ bg: "#F06292", dark: "#D04577" }, // ローズピンク
] as const;

function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return hash >>> 0; // 符号なし32ビット整数に変換
}

export function getTabColor(id: Identifier): {
	bg: string;
	dark: string;
} {
	const hash = hashString(id);
	const index = hash % TAB_COLORS.length;
	return TAB_COLORS[index];
}

export default getTabColor;
