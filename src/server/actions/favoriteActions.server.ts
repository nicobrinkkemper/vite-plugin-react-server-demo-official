"use server";
import { getDb } from "../db.server.js";

export async function getFavorites(): Promise<string[]> {
  const db = await getDb();
  const stmt = db.prepare("SELECT name FROM favorites ORDER BY created_at ASC");
  return (stmt.all() as { name: string }[]).map((row) => row.name);
}

export async function toggleFavorite(
  name: string,
): Promise<{ favorite: boolean }> {
  const db = await getDb();
  const exists = db
    .prepare("SELECT 1 FROM favorites WHERE name = ?")
    .get(name);
  if (exists) {
    db.prepare("DELETE FROM favorites WHERE name = ?").run(name);
    return { favorite: false };
  }
  db.prepare("INSERT INTO favorites (name) VALUES (?)").run(name);
  return { favorite: true };
}
