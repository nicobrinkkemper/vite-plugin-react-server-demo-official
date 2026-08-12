// Regenerate the vendored full-dex dataset: node scripts/generate-pokedex.mjs
// Static builds read the committed JSON and never touch the network; only
// per-request renders of special forms (ids above 10000) fetch PokéAPI live.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/pokedex.json", import.meta.url));
const COUNT = 1025;

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

// Every Pokémon's name+id (sprites are addressed by id), served as a static
// asset so client-side search covers the whole roster without shipping the
// index in the page.
const NAMES_OUT = fileURLToPath(new URL("../public/names.json", import.meta.url));
const list = await get("https://pokeapi.co/api/v2/pokemon?limit=100000");
const names = list.results
  .map((entry) => {
    const id = Number(entry.url.match(/\/pokemon\/(\d+)\//)?.[1]);
    return { id, name: entry.name };
  })
  .filter((entry) => Number.isFinite(entry.id));
writeFileSync(NAMES_OUT, JSON.stringify(names) + "\n");
console.log(`wrote ${names.length} names to ${NAMES_OUT}`);
