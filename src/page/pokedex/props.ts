import { baseHref, gen1 } from "../../lib/pokedex.js";

export const props = (url: string) => ({
  title: "Pokédex — all 151",
  url,
  pokedex: gen1,
  searchAction: `${baseHref()}pokedex/`,
  navigation: {
    back: { href: baseHref(), text: "Back" },
  },
});

export type Props = ReturnType<typeof props>;
