import * as React from "react";
import { Link } from "../components/Link.client.js";
import { PokemonCard } from "../components/PokemonCard.js";
import { WalkingBidoof } from "../components/WalkingBidoof.client.js";
import { sprite, spriteBack } from "../lib/pokedex.js";
import styles from "../css/home.module.css";
import packageJson from "../../package.json" with { type: "json" };
import type { Props } from "./props.js";

const BIDOOF_ID = 399;

export const Page = ({ title, navigation, featured, isGithubPages }: Props) => {
  return (
    <>
      <title>{title}</title>
      <link
        rel="icon"
        href={`${import.meta.env.PUBLIC_ORIGIN}${import.meta.env.BASE_URL}favicon.ico`}
        type="image/x-icon"
      />
      <div className={styles["Home"]}>
        <WalkingBidoof
          srcFront={sprite(BIDOOF_ID)}
          srcBack={spriteBack(BIDOOF_ID)}
          alt="Bidoof walking around"
          index={0}
        />
        <div className={styles["Panel"]}>
          <h1>Pokédex</h1>
          <p>
            A static-first Pokédex built with{" "}
            <a
              href={packageJson.repository}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["Url"]}
            >
              vite-plugin-react-server
            </a>
            . All 151 original Pokémon are prerendered to static HTML at build
            time from a committed dataset — no network, no server needed.
          </p>
          <p>
            Every other Pokémon renders <em>per request</em> on the same route,
            fetched live from PokéAPI. Try{" "}
            <Link to={navigation.toBidoof.href} className={styles["Url"]}>
              Bidoof
            </Link>{" "}
            — it&apos;s gen 4, so it isn&apos;t in the static build.
            {isGithubPages &&
              " (This deploy is static-only, so Bidoof will 404 here — clone the repo and `npm run demo` to see the live path.)"}
          </p>
          <nav>
            <Link to={navigation.toPokedex.href} className={styles["Cta"]}>
              {navigation.toPokedex.text}
            </Link>
          </nav>
          <h2>Starters</h2>
          <ul className={styles["Featured"]}>
            {featured.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
