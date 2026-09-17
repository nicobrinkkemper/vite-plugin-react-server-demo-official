// The likes store behind the "use server" actions. Two backends, chosen per
// call from the action's trailing context:
//
// - Cloudflare Workers: bindings arrive per request on the fetch handler's
//   `env`, which worker.mjs forwards as `platform[0]`. A `LIKES` D1 binding
//   there means the action runs on D1.
// - Node (the Express prod server, dev, the e2e suite): `platform` is empty,
//   so the store falls back to node:sqlite on disk.
//
// The sqlite import stays lazy on purpose: a top-level `import "node:sqlite"`
// would be baked into the edge bundle's module scope and crash evaluation on
// runtimes without node builtins. Deferring it keeps the bundle boot-safe
// everywhere; the import only runs when a Node host actually executes an
// action.

import { MAX_LIKES } from "../lib/likes.js";

/** The context vite-plugin-react-server appends to every action call. */
export type ActionContext = { platform?: unknown[] };

export type LikesStore = {
  /** How many visitors like this Pokémon. */
  count(pokemon: string): Promise<number>;
  liked(pokemon: string, visitor: string): Promise<boolean>;
  /** A no-op once the Pokémon holds MAX_LIKES rows. */
  like(pokemon: string, visitor: string): Promise<void>;
  unlike(pokemon: string, visitor: string): Promise<void>;
};

// One row per (Pokémon, visitor): a visitor likes a Pokémon at most once, and
// the count is the number of rows.
const SCHEMA = `CREATE TABLE IF NOT EXISTS likes (
  pokemon TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pokemon, visitor)
) STRICT`;

const SQL = {
  count: "SELECT COUNT(*) AS n FROM likes WHERE pokemon = ?",
  liked: "SELECT 1 AS one FROM likes WHERE pokemon = ? AND visitor = ?",
  // The cap lives in the statement so two concurrent likes at the ceiling
  // cannot both squeeze in: the count is checked and the row written in one
  // step. Parameters: pokemon, visitor, pokemon, cap.
  like: `INSERT OR IGNORE INTO likes (pokemon, visitor)
    SELECT ?, ? WHERE (SELECT COUNT(*) FROM likes WHERE pokemon = ?) < ?`,
  unlike: "DELETE FROM likes WHERE pokemon = ? AND visitor = ?",
};

// The slice of D1's prepared-statement API the store uses.
type D1Statement = {
  bind(...values: unknown[]): D1Statement;
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
  const env = ctx?.platform?.[0] as { LIKES?: unknown } | undefined;
  return isD1(env?.LIKES) ? env.LIKES : undefined;
};

const d1Store = (db: D1Like): LikesStore => {
  const ready = db.prepare(SCHEMA).run();
  return {
    count: async (pokemon) => {
      await ready;
      const row = await db.prepare(SQL.count).bind(pokemon).first<{ n: number }>();
      return row?.n ?? 0;
    },
    liked: async (pokemon, visitor) => {
      await ready;
      return (await db.prepare(SQL.liked).bind(pokemon, visitor).first()) !== null;
    },
    like: async (pokemon, visitor) => {
      await ready;
      await db.prepare(SQL.like).bind(pokemon, visitor, pokemon, MAX_LIKES).run();
    },
    unlike: async (pokemon, visitor) => {
      await ready;
      await db.prepare(SQL.unlike).bind(pokemon, visitor).run();
    },
  };
};

type SqliteDb = import("node:sqlite").DatabaseSync;
let sqlite: Promise<SqliteDb> | undefined;

const sqliteStore = (): LikesStore => {
  sqlite ??= import("node:sqlite").then(({ DatabaseSync }) => {
    const db = new DatabaseSync("pokedex.db", { open: true });
    db.exec(SCHEMA);
    return db;
  });
  const open = sqlite;
  return {
    count: async (pokemon) => {
      const db = await open;
      const row = db.prepare(SQL.count).get(pokemon) as { n: number } | undefined;
      return row?.n ?? 0;
    },
    liked: async (pokemon, visitor) => {
      const db = await open;
      return db.prepare(SQL.liked).get(pokemon, visitor) !== undefined;
    },
    like: async (pokemon, visitor) => {
      const db = await open;
      db.prepare(SQL.like).run(pokemon, visitor, pokemon, MAX_LIKES);
    },
    unlike: async (pokemon, visitor) => {
      const db = await open;
      db.prepare(SQL.unlike).run(pokemon, visitor);
    },
  };
};

export const likesStore = (ctx?: ActionContext): LikesStore => {
  const d1 = d1Binding(ctx);
  return d1 ? d1Store(d1) : sqliteStore();
};
