import type Database from "@tauri-apps/plugin-sql";
import { ArkErrors, type } from "arktype";
import { v7 as uuidv7 } from "uuid";
import { type DiaryPaneData, DiaryPaneDataValidator } from "@/app/diary-pane";
import { DIARY_DB_VERSION, getDatabase } from "./db";
import { getDiaryTemplate } from "./diary-template-db";

export async function initDB(db: Database) {
	db.execute(`
    CREATE TABLE IF NOT EXISTS Diaries(
      id TEXT PRIMARY KEY NOT NULL,
      templateId TEXT NULL,
      templateName TEXT NULL,
      version INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
			colSize INTEGER NOT NULL,
      rowSize INTEGER NOT NULL,
      data TEXT NOT NULL,
      FOREIGN KEY (templateId) REFERENCES DiaryTemplates(id) ON DELETE SET NULL
    );
  `);
}

export async function createDiary(data: DiaryPaneData[], templateId?: string) {
	const id = uuidv7();
	const now = new Date().toISOString();

	const colSize = data.reduce(
		(max, pane) => Math.max(max, pane.pos.x + pane.size.width),
		0,
	);
	const rowSize = data.reduce(
		(max, pane) => Math.max(max, pane.pos.y + pane.size.height),
		0,
	);
	let templateName: string | null = null;
	if (templateId != null) {
		const diaryTemplate = await getDiaryTemplate(templateId);
		if (diaryTemplate instanceof ArkErrors) {
			throw new Error(
				`Failed to fetch diary template for diary creation: ${diaryTemplate}`,
			);
		}
		templateName = diaryTemplate?.name ?? null;
	}

	const db = await getDatabase();
	await db.execute(
		`
    INSERT INTO Diaries (
      id, templateId, templateName, version, createdAt, updatedAt, colSize, rowSize, data
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `,
		[
			id,
			templateId,
			templateName,
			DIARY_DB_VERSION,
			now,
			now,
			colSize,
			rowSize,
			JSON.stringify(data),
		],
	);
	return id;
}

const DiaryDBResponseValidator = type({
	id: "string.uuid.v7",
	templateId: "string.uuid.v7 | null",
	templateName: "string | null",
	version: "number.integer",
	createdAt: "string.date.iso",
	updatedAt: "string.date.iso",
	colSize: "number.integer >= 0",
	rowSize: "number.integer >= 0",
	data: "string.json",
}).pipe.try(
	(result) => {
		const diaryData = DiaryPaneDataValidator.array()(JSON.parse(result.data));
		return { ...result, data: diaryData };
	},
	type({
		id: "string.uuid.v7",
		templateId: "string.uuid.v7 | null",
		templateName: "string | null",
		version: "number.integer",
		createdAt: "string.date.iso",
		updatedAt: "string.date.iso",
		colSize: "number.integer >= 0",
		rowSize: "number.integer >= 0",
		data: DiaryPaneDataValidator.array(),
	}),
);

export type DiaryDBResponse = {
	id: string;
	templateId: string | null;
	templateName: string | null;
	version: number;
	createdAt: string;
	updatedAt: string;
	colSize: number;
	rowSize: number;
	data: DiaryPaneData[];
};

export async function getDiaries(limit: number, offset = 0) {
	const db = await getDatabase();
	const result = await db.select(`SELECT * FROM Diaries LIMIT ? OFFSET ?`, [
		limit,
		offset,
	]);
	console.log("Diaries fetched from DB:", result);
	const diaries = DiaryDBResponseValidator.array()(result);
	return diaries;
}

export async function getDiary(id: string) {
	const db = await getDatabase();
	const result = await db.select(`SELECT * FROM Diaries WHERE id = ?`, [id]);
	const diaries = DiaryDBResponseValidator.array()(result);
	if (diaries instanceof ArkErrors) {
		return diaries;
	}
	if (diaries.length === 0) return null;
	return diaries[0];
}
