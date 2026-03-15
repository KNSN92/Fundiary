import Database from "@tauri-apps/plugin-sql";
import { initDB as initUserDB } from "./user-db";
import { initDB as initDiaryDB } from "./diary-db";
import { initDB as initDiaryTemplateDB } from "./diary-template-db";
import { initDB as initImageDB } from "./image-db";

export const DIARY_DB_VERSION = 1000;

let db: Database | null = null;

async function initDB(): Promise<Database> {
	const db = await Database.load("sqlite:global.db");

	await initUserDB(db);
	await initDiaryTemplateDB(db);
	await initDiaryDB(db);
	await initImageDB(db);

	return db;
}

export async function getDatabase() {
	if (db == null) db = await initDB();
	return db;
}
