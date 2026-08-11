import * as React from "react";
import { Link } from "../../components/Link.client.js";
import { PokemonCard } from "../../components/PokemonCard.js";
import { PokemonSearch } from "../../components/PokemonSearch.client.js";
import styles from "../../css/pokedex.module.css";
import type { Props } from "./props.js";

export const Page = ({ title, pokedex, navigation, searchAction, namesHref, staticOnly }: Props) => (
  <>
    <title>{title}</title>
    <div className={styles["Pokedex"]}>
      <header className={styles["Header"]}>
        <Link to={navigation.back.href} className={styles["Back"]}>
          {navigation.back.text}
        </Link>
        <h1>Pokédex</h1>
        <p>All {pokedex.length} Pokémon, prerendered at build time.</p>
        <PokemonSearch namesHref={namesHref} action={searchAction} staticOnly={staticOnly} />
      </header>
      <ul className={styles["Grid"]}>
        {pokedex.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </ul>
    </div>
  </>
);
