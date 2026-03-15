import type Database from "@tauri-apps/plugin-sql";
import { ArkErrors, type } from "arktype";
import type { Uuid } from "fundiary-api";
import { getDatabase } from "./db";

export async function initDB(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Users(
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      streakBeginAt TEXT,
      streakLatestAt TEXT,
      createdAt TEXT NOT NULL,
    );
  `);
}

export interface User {
  id: string,
  name: string,
  streakBeginAt: Date | null,
  streakLatestAt: Date | null,
  createdAt: Date,
}

const UserValidator = type({
  id: "string.uuid.v7",
  name: "string",
  streakBeginAt: "string.date.iso | null",
  streakLatestAt: "string.date.iso | null",
  createdAt: "string.date.iso",
}).pipe((obj) => ({
  id: obj.id,
  name: obj.name,
  streakBeginAt: obj.streakBeginAt ? new Date(obj.streakBeginAt) : null,
  streakLatestAt: obj.streakLatestAt ? new Date(obj.streakLatestAt) : null,
  createdAt: new Date(obj.createdAt),
}) as User);

export async function createUser(id: Uuid, name: string): Promise<User> {
  const db = await getDatabase();
  const now = new Date();
  await db.execute(
    "INSERT INTO Users (id, name, streakBeginAt, streakLatestAt, createdAt) VALUES (?, ?, ?, ?, ?)",
    [id, name, null, null, now.toISOString()]
  );
  return {
    id,
    name,
    streakBeginAt: null,
    streakLatestAt: null,
    createdAt: now,
  };
}

export async function getUser(id: Uuid): Promise<User | ArkErrors | null> {
  const db = await getDatabase();
  const result = await db.select<unknown[]>("SELECT * FROM Users WHERE id = ?", [id]);
  if (result.length === 0) {
    return null;
  }
  const user = UserValidator(result[0]);
  return user;
}

export async function getStreak(id: Uuid): Promise<number | ArkErrors | null> {
  const user = await getUser(id);
  if (user == null) {
    return null;
  }
  if (user instanceof ArkErrors) {
    return user;
  }
  const streakLatestAt = user.streakLatestAt;
  const streakBeginAt = user.streakBeginAt;

  if (!streakLatestAt || !streakBeginAt) {
    return 0;
  }

  const streakBeginDay = Math.floor(streakBeginAt.getTime() / (1000 * 3600 * 24));
  const streakLatestDay = Math.floor(streakLatestAt.getTime() / (1000 * 3600 * 24));

  return streakLatestDay - streakBeginDay;
}

type StreakStatus = "streaking" | "broken";

export async function streakStatus(id: Uuid): Promise<StreakStatus | ArkErrors | null> {
  const user = await getUser(id);
  if (user == null) {
    return null;
  }
  if (user instanceof ArkErrors) {
    return user;
  }
  const streakLatestAt = user.streakLatestAt;
  const streakBeginAt = user.streakBeginAt;

  if (!streakLatestAt || !streakBeginAt) {
    return "broken";
  }

  const today = Math.floor(Date.now() / (1000 * 3600 * 24));
  const streakLatestDay = Math.floor(streakLatestAt.getTime() / (1000 * 3600 * 24));

  if(streakLatestDay === today) {
    return "streaking";
  } else {
    return "broken";
  }
}

export async function updateStreak(id: Uuid, date: Date): Promise<ArkErrors | undefined> {
  const user = await getUser(id);
  if (user == null) {
    return undefined;
  }
  if (user instanceof ArkErrors) {
    return user;
  }
  const streakLatestAt = user.streakLatestAt;
  const streakBeginAt = user.streakBeginAt;

  const db = await getDatabase();
  if (!streakLatestAt || !streakBeginAt) {
    // ストリークが存在しない場合は新規作成
    await db.execute(
      "UPDATE Users SET streakBeginAt = ?, streakLatestAt = ? WHERE id = ?",
      [date.toISOString(), date.toISOString(), id]
    );
    return undefined;
  }

  const today = Math.floor(Date.now() / (1000 * 3600 * 24));
  const streakLatestDay = Math.floor(streakLatestAt.getTime() / (1000 * 3600 * 24));

  if(streakLatestDay === today) {
    // 今日すでにストリークが更新されている場合は何もしない
    return undefined;
  } else if (streakLatestDay === today - 1) {
    // 昨日ストリークが更新されている場合はストリークを継続
    await db.execute(
      "UPDATE Users SET streakLatestAt = ? WHERE id = ?",
      [date.toISOString(), id]
    );
    return undefined;
  } else {
    // それ以外の場合はストリークが途切れているので新規作成
    await db.execute(
      "UPDATE Users SET streakBeginAt = ?, streakLatestAt = ? WHERE id = ?",
      [date.toISOString(), date.toISOString(), id]
    );
    return undefined;
  }
}
