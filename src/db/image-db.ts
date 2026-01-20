import type Database from "@tauri-apps/plugin-sql";
import { ArkErrors, type } from "arktype";
import { v7 as uuidv7 } from "uuid";
import { getDatabase } from "./db";

/**
 * 画像テーブルの初期化
 */
export async function initDB(db: Database) {
	await db.execute(`
    CREATE TABLE IF NOT EXISTS Images(
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER NULL,
      height INTEGER NULL,
      data BLOB NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

/**
 * 画像データの型定義
 */
export interface ImageData {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	width: number | null;
	height: number | null;
	data: Uint8Array;
	createdAt: Date;
}

/**
 * 画像メタデータの型定義（dataを除いた軽量版）
 */
export interface ImageMetadata {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	width: number | null;
	height: number | null;
	createdAt: Date;
}

const ImageMetadataDBResponseValidator = type({
	id: "string.uuid.v7",
	name: "string",
	mimeType: "string",
	size: "number.integer >= 0",
	width: "number.integer | null",
	height: "number.integer | null",
	createdAt: "string.date.iso",
});

/**
 * 画像を保存する
 * @param file Fileオブジェクト または Blob
 * @param name ファイル名（省略時はFileから取得、Blobの場合は必須）
 * @returns 保存された画像のID
 */
export async function saveImage(
	file: File | Blob,
	name?: string,
): Promise<string> {
	const id = uuidv7();
	const now = new Date().toISOString();

	const fileName = name ?? (file instanceof File ? file.name : "image");
	const mimeType = file.type || "application/octet-stream";
	const size = file.size;

	// BlobをArrayBufferに変換
	const arrayBuffer = await file.arrayBuffer();
	const data = new Uint8Array(arrayBuffer);

	// 画像の場合、幅と高さを取得
	let width: number | null = null;
	let height: number | null = null;

	if (mimeType.startsWith("image/")) {
		const dimensions = await getImageDimensions(file);
		width = dimensions.width;
		height = dimensions.height;
	}

	const db = await getDatabase();
	await db.execute(
		`
    INSERT INTO Images (
      id, name, mimeType, size, width, height, data, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?
    )
  `,
		[id, fileName, mimeType, size, width, height, Array.from(data), now],
	);

	return id;
}

/**
 * 画像の幅と高さを取得する
 */
async function getImageDimensions(
	blob: Blob,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(blob);
		const img = new Image();

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to load image for dimension calculation"));
		};

		img.src = url;
	});
}

/**
 * 画像を取得する（データ含む）
 * @param id 画像ID
 * @returns 画像データまたはnull
 */
export async function getImage(id: string): Promise<ImageData | null> {
	const db = await getDatabase();
	const result = await db.select<
		{
			id: string;
			name: string;
			mimeType: string;
			size: number;
			width: number | null;
			height: number | null;
			data: number[];
			createdAt: string;
		}[]
	>("SELECT * FROM Images WHERE id = ?", [id]);

	if (result.length === 0) {
		return null;
	}

	const row = result[0];
	return {
		id: row.id,
		name: row.name,
		mimeType: row.mimeType,
		size: row.size,
		width: row.width,
		height: row.height,
		data: new Uint8Array(row.data),
		createdAt: new Date(row.createdAt),
	};
}

/**
 * 画像のメタデータのみを取得する（軽量）
 * @param id 画像ID
 * @returns 画像メタデータまたはnull
 */
export async function getImageMetadata(
	id: string,
): Promise<ImageMetadata | ArkErrors | null> {
	const db = await getDatabase();
	const result = await db.select<unknown[]>(
		"SELECT id, name, mimeType, size, width, height, createdAt FROM Images WHERE id = ?",
		[id],
	);

	if (result.length === 0) {
		return null;
	}

	const validated = ImageMetadataDBResponseValidator(result[0]);
	if (validated instanceof ArkErrors) {
		return validated;
	}

	return {
		...validated,
		createdAt: new Date(validated.createdAt),
	};
}

/**
 * 画像一覧を取得する（メタデータのみ）
 * @param limit 取得件数
 * @param offset オフセット
 * @returns 画像メタデータの配列
 */
export async function getImages(
	limit = 50,
	offset = 0,
): Promise<(ImageMetadata | ArkErrors)[] | ArkErrors> {
	const db = await getDatabase();
	const result = await db.select<unknown[]>(
		"SELECT id, name, mimeType, size, width, height, createdAt FROM Images ORDER BY createdAt DESC LIMIT ? OFFSET ?",
		[limit, offset],
	);

	return result.map((row) => {
		const validated = ImageMetadataDBResponseValidator(row);
		if (validated instanceof ArkErrors) {
			return validated;
		}
		return {
			...validated,
			createdAt: new Date(validated.createdAt),
		};
	});
}

/**
 * 画像を削除する
 * @param id 画像ID
 * @returns 削除が成功したかどうか
 */
export async function deleteImage(id: string): Promise<boolean> {
	const db = await getDatabase();
	const result = await db.execute("DELETE FROM Images WHERE id = ?", [id]);
	return result.rowsAffected > 0;
}

/**
 * 画像をBlobとして取得する（表示用）
 * @param id 画像ID
 * @returns Blobまたはnull
 */
export async function getImageAsBlob(id: string): Promise<Blob | null> {
	const image = await getImage(id);
	if (image == null) {
		return null;
	}
	// Uint8Arrayから新しいArrayBufferを作成してBlobに渡す
	const buffer = new ArrayBuffer(image.data.length);
	new Uint8Array(buffer).set(image.data);
	return new Blob([buffer], { type: image.mimeType });
}

/**
 * 画像をData URLとして取得する（img srcに直接使用可能）
 * @param id 画像ID
 * @returns Data URLまたはnull
 */
export async function getImageAsDataURL(id: string): Promise<string | null> {
	const blob = await getImageAsBlob(id);
	if (blob == null) {
		return null;
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error("Failed to read blob as data URL"));
		reader.readAsDataURL(blob);
	});
}

/**
 * 画像をObject URLとして取得する（使用後はrevokeObjectURLを呼ぶこと）
 * @param id 画像ID
 * @returns Object URLまたはnull
 */
export async function getImageAsObjectURL(id: string): Promise<string | null> {
	const blob = await getImageAsBlob(id);
	if (blob == null) {
		return null;
	}
	return URL.createObjectURL(blob);
}
