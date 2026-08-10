import pokedex from "../data/pokedex.json" with { type: "json" };

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  stats: Record<string, number>;
  flavor?: string;
};

export const gen1 = pokedex as Pokemon[];

export const findLocal = (name: string): Pokemon | undefined =>
  gen1.find((p) => p.name === name.toLowerCase());

const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const sprite = (id: number) => `${SPRITES}/${id}.png`;
export const spriteBack = (id: number) => `${SPRITES}/back/${id}.png`;
export const artwork = (id: number) =>
  `${SPRITES}/other/official-artwork/${id}.png`;

export const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

type ApiPokemon = {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
};

export async function fetchLive(name: string): Promise<Pokemon | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`,
      { signal: controller.signal },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ApiPokemon;
    return {
      id: data.id,
      name: data.name,
      types: data.types.map((t) => t.type.name),
      height: data.height,
      weight: data.weight,
      stats: Object.fromEntries(
        data.stats.map((s) => [s.stat.name, s.base_stat]),
      ),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const baseHref = () => {
  const origin = import.meta.env.PUBLIC_ORIGIN ?? "";
  const base = import.meta.env.BASE_URL ?? "/";
  let pathname = origin.includes("//")
    ? new URL(base, origin).pathname
    : origin + base;
  if (!pathname.endsWith("/")) pathname += "/";
  return pathname;
};
