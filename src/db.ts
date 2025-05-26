"use server";

import { DatabaseSync } from "node:sqlite";

// Initialize database
export const db = new DatabaseSync("todos.db");

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`);
