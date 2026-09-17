"use server";
import { favoritesStore, type ActionContext } from "../db.server.js";

// Every action receives a trailing context from vite-plugin-react-server:
// `{ platform }` carries whatever the runtime handed the fetch handler after
// the request (workerd's env and ctx), and is empty on Node. The client calls
// these with their declared arguments only; the gate appends the context.

export async function getFavorites(ctx?: ActionContext): Promise<string[]> {
  return favoritesStore(ctx).list();
}

export async function toggleFavorite(
  name: string,
  ctx?: ActionContext,
): Promise<{ favorite: boolean }> {
  const store = favoritesStore(ctx);
  if (await store.has(name)) {
    await store.remove(name);
    return { favorite: false };
  }
  await store.add(name);
  return { favorite: true };
}
