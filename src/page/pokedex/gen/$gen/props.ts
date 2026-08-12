import { notFound } from "vite-plugin-react-server/router";
import { baseHref, byGeneration, GENERATIONS } from "../../../../lib/pokedex.js";

export const props = (
  _url: string,
  ctx?: { params?: { gen?: string } },
) => {
  const gen = Number(ctx?.params?.gen);
  const entry = GENERATIONS.find((g) => g.gen === gen);
  if (!entry) throw notFound();
  const pathname = baseHref();
  return {
    title: `Gen ${gen}`,
    gen: entry,
    pokedex: byGeneration(gen),
    navigation: {
      back: { href: `${pathname}pokedex/`, text: "Pokédex" },
      prev:
        gen > 1
          ? { href: `${pathname}pokedex/gen/${gen - 1}/`, text: `Gen ${gen - 1}` }
          : null,
      next:
        gen < GENERATIONS.length
          ? { href: `${pathname}pokedex/gen/${gen + 1}/`, text: `Gen ${gen + 1}` }
          : null,
    },
  };
};

export type Props = ReturnType<typeof props>;
