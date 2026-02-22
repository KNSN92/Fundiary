import type Database from "@tauri-apps/plugin-sql";
import { ArkErrors, type } from "arktype";
import {
	type DiaryPaneData,
	DiaryPaneDataValidator,
} from "fundiary-api/api/diary-pane";

import { DIARY_DB_VERSION, getDatabase } from "./db";
import { fromUuidOrThrow, type Uuid, uuid } from "fundiary-api";

export async function initDB(db: Database) {
	db.execute(`
    CREATE TABLE IF NOT EXISTS DiaryTemplates(
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      version INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      colSize INTEGER NOT NULL,
      rowSize INTEGER NOT NULL,
      template TEXT NOT NULL
    );
  `);
}

export async function createDiaryTemplate(
	name: string,
	template: DiaryPaneData[],
) {
	const id = uuid();
	const now = new Date().toISOString();

	const colSize = template.reduce(
		(max, paneData) => Math.max(max, paneData.pos.x + paneData.size.width),
		0,
	);
	const rowSize = template.reduce(
		(max, paneData) => Math.max(max, paneData.pos.y + paneData.size.height),
		0,
	);

	const db = await getDatabase();
	await db.execute(
		`
    INSERT INTO DiaryTemplates (
      id, name, version, createdAt, updatedAt, colSize, rowSize, template
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `,
		[
			id,
			name,
			DIARY_DB_VERSION,
			now,
			now,
			colSize,
			rowSize,
			JSON.stringify(template),
		],
	);
	return id;
}

const DiaryTemplateDBResponseValidator = type({
	id: "string.uuid.v7",
	name: "string",
	version: "number.integer",
	createdAt: "string.date.iso",
	updatedAt: "string.date.iso",
	colSize: "number.integer >= 0",
	rowSize: "number.integer >= 0",
	template: "string.json",
}).pipe.try(
	(result) => {
		const diaryTemplateData = DiaryPaneDataValidator.array()(
			JSON.parse(result.template),
		);
		return { ...result, id: fromUuidOrThrow(result.id), template: diaryTemplateData };
	}
);

export type DiaryTemplateDBResponse = {
	id: Uuid;
	name: string;
	version: number;
	createdAt: string;
	updatedAt: string;
	colSize: number;
	rowSize: number;
	template: DiaryPaneData[];
};

export async function getDiaryTemplates(limit: number, offset = 0) {
	const db = await getDatabase();
	const result = await db.select(
		`SELECT * FROM DiaryTemplates LIMIT ? OFFSET ?`,
		[limit, offset],
	);
	const diaryTemplates = DiaryTemplateDBResponseValidator.array()(result);
	return diaryTemplates;
}

export async function getDiaryTemplate(id: Uuid) {
	const db = await getDatabase();
	const result = await db.select(`SELECT * FROM DiaryTemplates WHERE id = ?`, [
		id,
	]);
	const diaryTemplates = DiaryTemplateDBResponseValidator.array()(result);
	if (diaryTemplates instanceof ArkErrors) {
		return diaryTemplates;
	}
	if (diaryTemplates.length === 0) return null;
	const diaryTemplate = diaryTemplates[0];
	if (diaryTemplate.template instanceof ArkErrors) {
		return diaryTemplate;
	}
	return diaryTemplate;
}
