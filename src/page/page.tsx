import * as React from "react";
import { Link } from "vite-plugin-react-server/router/client";
import { PokemonCard } from "../components/PokemonCard.js";
import { WalkingBidoof } from "../components/WalkingBidoof.client.js";
import { sprite, spriteBack } from "../lib/pokedex.js";
import styles from "../css/home.module.css";
import packageJson from "../../package.json" with { type: "json" };
import type { Props } from "./props.js";

const BIDOOF_ID = 399;

export const Page = ({ title, navigation, featured }: Props) => {
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
          <nav>
            <Link to={navigation.toPokedex.href} className={styles["Cta"]}>
              {navigation.toPokedex.text}
            </Link>
          </nav>
          <ul className={styles["Featured"]}>
            {featured.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
          </ul>
          <p className={styles["Footer"]}>
            <a
              href={packageJson.repository}
              target="_blank"
              rel="noopener noreferrer"
              className={styles["Url"]}
            >
              vite-plugin-react-server
            </a>{" "}
            demo — source &amp; how it works
          </p>
        </div>
      </div>
    </>
  );
};
