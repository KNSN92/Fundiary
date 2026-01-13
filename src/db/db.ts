import Database from "@tauri-apps/plugin-sql";
import { initDB as initDiaryDB } from "./diary-db";
import { initDB as initDiaryTemplateTable } from "./diary-template-db";

export const DIARY_DB_VERSION = 1000;

let db: Database | null = null;

async function initDB(): Promise<Database> {
	const db = await Database.load("sqlite:global.db");

	await initDiaryTemplateTable(db);
	await initDiaryDB(db);

	return db;
}

export async function getDatabase() {
	if (db == null) db = await initDB();
	return db;
}
