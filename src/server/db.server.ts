// The favorites store behind the "use server" actions. Two backends, chosen
// per call from the action's trailing context:
//
// - Cloudflare Workers: bindings arrive per request on the fetch handler's
//   `env`, which worker.mjs forwards as `platform[0]`. A `FAVORITES` D1
//   binding there means the action runs on D1.
// - Node (the Express prod server, dev, the e2e suite): `platform` is empty,
//   so the store falls back to node:sqlite on disk.
//
// The sqlite import stays lazy on purpose: a top-level `import "node:sqlite"`
// would be baked into the edge bundle's module scope and crash evaluation on
// runtimes without node builtins. Deferring it keeps the bundle boot-safe
// everywhere; the import only runs when a Node host actually executes a
// favorites action.

/** The context vite-plugin-react-server appends to every action call. */
export type ActionContext = { platform?: unknown[] };

export type FavoritesStore = {
  list(): Promise<string[]>;
  has(name: string): Promise<boolean>;
  add(name: string): Promise<void>;
  remove(name: string): Promise<void>;
};

const SCHEMA = `CREATE TABLE IF NOT EXISTS favorites (
  name TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT`;

// The slice of D1's prepared-statement API the store uses.
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};
type D1Like = { prepare(sql: string): D1Statement };

const isD1 = (value: unknown): value is D1Like =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { prepare?: unknown }).prepare === "function";

/** The D1 binding on workerd's env, when the request came through a Worker. */
const d1Binding = (ctx?: ActionContext): D1Like | undefined => {
  const env = ctx?.platform?.[0] as { FAVORITES?: unknown } | undefined;
  return isD1(env?.FAVORITES) ? env.FAVORITES : undefined;
};

const d1Store = (db: D1Like): FavoritesStore => {
  const ready = db.prepare(SCHEMA).run();
  return {
    list: async () => {
      await ready;
      const { results } = await db
        .prepare("SELECT name FROM favorites ORDER BY created_at ASC")
        .all<{ name: string }>();
      return results.map((row) => row.name);
    },
    has: async (name) => {
      await ready;
      const row = await db
        .prepare("SELECT 1 AS one FROM favorites WHERE name = ?")
        .bind(name)
        .first();
      return row !== null;
    },
    add: async (name) => {
      await ready;
      await db.prepare("INSERT INTO favorites (name) VALUES (?)").bind(name).run();
    },
    remove: async (name) => {
      await ready;
      await db.prepare("DELETE FROM favorites WHERE name = ?").bind(name).run();
    },
  };
};

type SqliteDb = import("node:sqlite").DatabaseSync;
let sqlite: Promise<SqliteDb> | undefined;

const sqliteStore = (): FavoritesStore => {
  sqlite ??= import("node:sqlite").then(({ DatabaseSync }) => {
    const db = new DatabaseSync("pokedex.db", { open: true });
    db.exec(SCHEMA);
    return db;
  });
  const open = sqlite;
  return {
    list: async () => {
      const db = await open;
      const rows = db
        .prepare("SELECT name FROM favorites ORDER BY created_at ASC")
        .all() as { name: string }[];
      return rows.map((row) => row.name);
    },
    has: async (name) => {
      const db = await open;
      return db.prepare("SELECT 1 FROM favorites WHERE name = ?").get(name) !== undefined;
    },
    add: async (name) => {
      const db = await open;
      db.prepare("INSERT INTO favorites (name) VALUES (?)").run(name);
    },
    remove: async (name) => {
      const db = await open;
      db.prepare("DELETE FROM favorites WHERE name = ?").run(name);
    },
  };
};

export const favoritesStore = (ctx?: ActionContext): FavoritesStore => {
  const d1 = d1Binding(ctx);
  return d1 ? d1Store(d1) : sqliteStore();
};
