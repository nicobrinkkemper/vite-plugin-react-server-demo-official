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

export type Generation = {
  gen: number;
  from: number;
  to: number;
  /** The gen's starter trio, for preview sprites. */
  starters: [number, number, number];
};

export const GENERATIONS: Generation[] = [
  { gen: 1, from: 1, to: 151, starters: [1, 4, 7] },
  { gen: 2, from: 152, to: 251, starters: [152, 155, 158] },
  { gen: 3, from: 252, to: 386, starters: [252, 255, 258] },
  { gen: 4, from: 387, to: 493, starters: [387, 390, 393] },
  { gen: 5, from: 494, to: 649, starters: [495, 498, 501] },
  { gen: 6, from: 650, to: 721, starters: [650, 653, 656] },
  { gen: 7, from: 722, to: 809, starters: [722, 725, 728] },
  { gen: 8, from: 810, to: 905, starters: [810, 813, 816] },
  { gen: 9, from: 906, to: 1025, starters: [906, 909, 912] },
];

export const byGeneration = (gen: number): Pokemon[] => {
  const g = GENERATIONS.find((entry) => entry.gen === gen);
  return g ? gen1.filter((p) => p.id >= g.from && p.id <= g.to) : [];
};

export const findLocal = (name: string): Pokemon | undefined =>
  gen1.find((p) => p.name === name.toLowerCase());

export { artwork, sprite, spriteBack } from "./sprites.js";

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
