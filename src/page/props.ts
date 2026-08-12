import { baseHref, gen1 } from "../lib/pokedex.js";

const FEATURED_IDS = [1, 4, 7, 25, 399];

export const props = (url: string) => {
  const pathname = baseHref();
  return {
    title: "Pokédex — vite-plugin-react-server",
    url,
    navigation: {
      toPokedex: { href: `${pathname}pokedex/`, text: "Browse the Pokédex" },
      toBidoof: { href: `${pathname}pokedex/bidoof/`, text: "Visit Bidoof" },
    },
    featured: gen1.filter((p) => FEATURED_IDS.includes(p.id)),
    isGithubPages: process.env.GITHUB_PAGES === "true",
  };
};

export type Props = ReturnType<typeof props>;
