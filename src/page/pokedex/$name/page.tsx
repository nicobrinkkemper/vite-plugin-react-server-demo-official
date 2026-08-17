import * as React from "react";
import { FavoriteButton } from "../../../components/FavoriteButton.client.js";
import { Link } from "../../../components/Link.client.js";
import { artwork, TYPE_COLORS } from "../../../lib/pokedex.js";
import styles from "../../../css/pokemon.module.css";
import type { Props } from "./props.js";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};
const MAX_BASE_STAT = 255;

export const Page = ({
  title,
  pokemon,
  live,
  toggleFavorite,
  getFavorites,
  navigation,
}: Props) => (
  <>
    <title>{`${title} — Pokédex`}</title>
    <div className={styles["Pokemon"]}>
      <header className={styles["Header"]}>
        <Link to={navigation.back.href} className={styles["Back"]}>
          ← {navigation.back.text}
        </Link>
        {live && (
          <span className={styles["LiveBadge"]}>
            rendered per request from PokéAPI
          </span>
        )}
      </header>
      <div className={styles["Card"]}>
        <img
          src={artwork(pokemon.id)}
          alt={pokemon.name}
          width={300}
          height={300}
          className={styles["Artwork"]}
        />
        <div className={styles["Info"]}>
          <p className={styles["Id"]}>#{String(pokemon.id).padStart(3, "0")}</p>
          <h1 className={styles["Name"]}>
            {pokemon.name}
            <FavoriteButton
              name={pokemon.name}
              toggleFavorite={toggleFavorite}
              getFavorites={getFavorites}
            />
          </h1>
          <p className={styles["Types"]}>
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={styles["Type"]}
                style={{ backgroundColor: TYPE_COLORS[type] }}
              >
                {type}
              </span>
            ))}
          </p>
          {pokemon.flavor && (
            <p className={styles["Flavor"]}>{pokemon.flavor}</p>
          )}
          <dl className={styles["Measurements"]}>
            <dt>Height</dt>
            <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
            <dt>Weight</dt>
            <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
          </dl>
          <dl className={styles["Stats"]}>
            {Object.entries(pokemon.stats).map(([stat, value]) => (
              <React.Fragment key={stat}>
                <dt>{STAT_LABELS[stat] ?? stat}</dt>
                <dd>
                  <span
                    className={styles["StatBar"]}
                    style={{ width: `${(value / MAX_BASE_STAT) * 100}%` }}
                  />
                  <span className={styles["StatValue"]}>{value}</span>
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </div>
    </div>
  </>
);
