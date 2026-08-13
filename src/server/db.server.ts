// Lazy on purpose: a top-level `import "node:sqlite"` would be baked into the
// edge bundle's module scope and crash evaluation on runtimes without node
// builtins (Cloudflare Workers). Deferring the import keeps the bundle
// boot-safe everywhere; the import only runs when a favorites action actually
// executes, which needs a Node host.
type SqliteDb = import("node:sqlite").DatabaseSync;

let db: SqliteDb | undefined;

export async function getDb(): Promise<SqliteDb> {
  if (!db) {
    const { DatabaseSync } = await import("node:sqlite");
    db = new DatabaseSync("pokedex.db", { open: true });
    db.exec(`
      CREATE TABLE IF NOT EXISTS favorites (
        name TEXT PRIMARY KEY,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `);
  }
  return db;
}
