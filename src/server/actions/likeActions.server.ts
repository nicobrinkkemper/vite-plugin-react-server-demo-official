"use server";
import { likesStore, type ActionContext } from "../db.server.js";

// Every action receives a trailing context from vite-plugin-react-server:
// `{ platform }` carries whatever the runtime handed the fetch handler after
// the request (workerd's env and ctx), and is empty on Node. The client calls
// these with their declared arguments only; the gate appends the context.

export type Likes = { count: number; liked: boolean };

// The visitor is an anonymous id the browser makes up once and keeps (see
// LikeButton). It identifies a browser, not a person — enough for a like
// count — and is validated here so the table only ever holds uuids.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const assertVisitor = (visitor: unknown): string => {
  if (typeof visitor !== "string" || !UUID.test(visitor)) {
    throw new Error("likes: visitor must be a uuid");
  }
  return visitor.toLowerCase();
};

const read = async (
  store: ReturnType<typeof likesStore>,
  pokemon: string,
  visitor: string,
): Promise<Likes> => ({
  count: await store.count(pokemon),
  liked: await store.liked(pokemon, visitor),
});

export async function getLikes(
  pokemon: string,
  visitor: string,
  ctx?: ActionContext,
): Promise<Likes> {
  return read(likesStore(ctx), pokemon, assertVisitor(visitor));
}

export async function toggleLike(
  pokemon: string,
  visitor: string,
  ctx?: ActionContext,
): Promise<Likes> {
  const store = likesStore(ctx);
  const id = assertVisitor(visitor);
  if (await store.liked(pokemon, id)) await store.unlike(pokemon, id);
  else await store.like(pokemon, id);
  return read(store, pokemon, id);
}
