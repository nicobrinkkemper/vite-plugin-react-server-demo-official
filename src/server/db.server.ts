import sqlite from "node:sqlite";

const db = new sqlite.DatabaseSync("pokedex.db", {
  open: true,
});

db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    name TEXT PRIMARY KEY,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  ) STRICT
`);

export { db };
