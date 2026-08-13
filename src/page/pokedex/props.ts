import { baseHref, GENERATIONS } from "../../lib/pokedex.js";

export const props = (url: string) => ({
  title: "Pokédex",
  url,
  generations: GENERATIONS,
  searchAction: `${baseHref()}pokedex/`,
  namesHref: `${baseHref()}names.json`,
  // Guarded: bare `process` does not exist on edge runtimes (workerd).
  staticOnly:
    typeof process !== "undefined" && process.env.GITHUB_PAGES === "true",
  navigation: {
    back: { href: baseHref(), text: "Home" },
  },
});

export type Props = ReturnType<typeof props>;
