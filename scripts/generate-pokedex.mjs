// Regenerate the vendored gen-1 dataset: node scripts/generate-pokedex.mjs
// Static builds read the committed JSON and never touch the network; only
// per-request renders of non-gen-1 Pokémon fetch PokéAPI live.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/pokedex.json", import.meta.url));
const COUNT = 151;

const get = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

const entries = [];
for (let id = 1; id <= COUNT; id++) {
  const [pokemon, species] = await Promise.all([
    get(`https://pokeapi.co/api/v2/pokemon/${id}`),
    get(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);
  const flavor = species.flavor_text_entries
    .find((e) => e.language.name === "en")
    ?.flavor_text.replace(/[\n\f\r]+/g, " ")
    .trim();
  entries.push({
    id,
    name: pokemon.name,
    types: pokemon.types.map((t) => t.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    stats: Object.fromEntries(
      pokemon.stats.map((s) => [s.stat.name, s.base_stat]),
    ),
    flavor,
  });
  if (id % 25 === 0) console.log(`${id}/${COUNT}`);
}

writeFileSync(OUT, JSON.stringify(entries, null, 1) + "\n");
console.log(`wrote ${entries.length} entries to ${OUT}`);
