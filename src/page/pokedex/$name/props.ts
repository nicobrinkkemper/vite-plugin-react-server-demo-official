import { notFound } from "vite-plugin-react-server/router";
import { baseHref, fetchLive, findLocal } from "../../../lib/pokedex.js";
import {
  getFavorites,
  toggleFavorite,
} from "../../../server/actions/favoriteActions.server.js";

export const props = async (
  _url: string,
  ctx?: { params?: { name?: string } },
) => {
  const name = ctx?.params?.name ?? "";
  const local = findLocal(name);
  const pokemon = local ?? (await fetchLive(name));
  if (!pokemon) throw notFound();
  return {
    title: pokemon.name,
    pokemon,
    live: !local,
    toggleFavorite,
    getFavorites,
    navigation: {
      back: { href: `${baseHref()}pokedex/`, text: "Pokédex" },
    },
  };
};

export type Props = Awaited<ReturnType<typeof props>>;
