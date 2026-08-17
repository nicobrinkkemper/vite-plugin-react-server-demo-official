import * as React from "react";
import { Link } from "vite-plugin-react-server/router/client";
import { baseHref, sprite, TYPE_COLORS, type Pokemon } from "../lib/pokedex.js";
import styles from "../css/pokedex.module.css";

export const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => (
  <li className={styles["Card"]}>
    <Link to={`${baseHref()}pokedex/${pokemon.name}/`} className={styles["CardLink"]}>
      <img
        src={sprite(pokemon.id)}
        alt={pokemon.name}
        width={96}
        height={96}
        loading="lazy"
      />
      <span className={styles["CardId"]}>
        #{String(pokemon.id).padStart(3, "0")}
      </span>
      <span className={styles["CardName"]}>{pokemon.name}</span>
      <span className={styles["CardTypes"]}>
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={styles["Type"]}
            style={{ backgroundColor: TYPE_COLORS[type] }}
          >
            {type}
          </span>
        ))}
      </span>
    </Link>
  </li>
);
