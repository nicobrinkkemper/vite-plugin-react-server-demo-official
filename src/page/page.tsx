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
            . Every Pokémon — all 1025 of them — is prerendered to static HTML
            at build time from a committed dataset. No network, no server
            needed.
          </p>
          <p>
            Special forms — Mega evolutions, regional variants — are not in the
            dataset. On a server they render <em>per request</em> on the same
            route, fetched live from PokéAPI.
            {isGithubPages &&
              " (This deploy is static-only, so forms are not available here — clone the repo and `npm run demo` for the live path.)"}{" "}
            And of course:{" "}
            <Link to={navigation.toBidoof.href} className={styles["Url"]}>
              visit Bidoof
            </Link>
            .
          </p>
          <nav>
            <Link to={navigation.toPokedex.href} className={styles["Cta"]}>
              {navigation.toPokedex.text}
            </Link>
          </nav>
          <h2>Featured</h2>
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
