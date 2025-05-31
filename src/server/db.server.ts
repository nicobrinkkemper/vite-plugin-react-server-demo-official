import sqlite from "node:sqlite";

// Initialize database
const db = new sqlite.DatabaseSync("todos.db", {
  open: true,
});

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`); 

export { db };