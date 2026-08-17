import * as React from "react";
import { Link } from "vite-plugin-react-server/router/client";
import { PokemonSearch } from "../../components/PokemonSearch.client.js";
import { sprite } from "../../lib/sprites.js";
import styles from "../../css/pokedex.module.css";
import type { Props } from "./props.js";

export const Page = ({ title, generations, navigation, searchAction, namesHref, staticOnly }: Props) => (
  <>
    <title>{title}</title>
    <div className={styles["Pokedex"]}>
      <header className={styles["Header"]}>
        <Link to={navigation.back.href} className={styles["Back"]}>
          ← {navigation.back.text}
        </Link>
        <h1>Pokédex</h1>
        <PokemonSearch namesHref={namesHref} action={searchAction} staticOnly={staticOnly} />
      </header>
      <ul className={styles["GenList"]}>
        {generations.map((g) => (
          <li key={g.gen} className={styles["Card"]}>
            <Link to={`${searchAction}gen/${g.gen}/`} className={styles["CardLink"]}>
              <span className={styles["GenSprites"]}>
                {g.starters.map((id) => (
                  <img key={id} src={sprite(id)} alt="" width={68} height={68} loading="lazy" />
                ))}
              </span>
              <span className={styles["CardName"]}>Gen {g.gen}</span>
              <span className={styles["CardId"]}>
                #{String(g.from).padStart(3, "0")} – #{String(g.to).padStart(3, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </>
);
