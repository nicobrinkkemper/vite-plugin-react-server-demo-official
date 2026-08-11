import * as React from "react";
import { Link } from "../../../../components/Link.client.js";
import { PokemonCard } from "../../../../components/PokemonCard.js";
import styles from "../../../../css/pokedex.module.css";
import type { Props } from "./props.js";

export const Page = ({ title, gen, pokedex, navigation }: Props) => (
  <>
    <title>{`${title} — Pokédex`}</title>
    <div className={styles["Pokedex"]}>
      <header className={styles["Header"]}>
        <Link to={navigation.back.href} className={styles["Back"]}>
          ← {navigation.back.text}
        </Link>
        <h1>Gen {gen.gen}</h1>
        <p>
          #{String(gen.from).padStart(3, "0")} – #
          {String(gen.to).padStart(3, "0")}
        </p>
      </header>
      <ul className={styles["Grid"]}>
        {pokedex.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </ul>
      <nav className={styles["GenNav"]}>
        {navigation.prev ? (
          <Link to={navigation.prev.href} className={styles["Back"]}>
            ← {navigation.prev.text}
          </Link>
        ) : (
          <span />
        )}
        {navigation.next && (
          <Link to={navigation.next.href} className={styles["Back"]}>
            {navigation.next.text} →
          </Link>
        )}
      </nav>
    </div>
  </>
);
