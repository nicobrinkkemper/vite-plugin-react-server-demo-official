"use client";
import * as React from "react";
import { useOptionalRouter } from "vite-plugin-react-server/router/client";
import { toSlug } from "../lib/slug.js";
import styles from "../css/pokedex.module.css";

// Lookup for ANY Pokémon: the datalist suggests the vendored gen-1 names, but
// free text reaches the same /pokedex/$name route — beyond gen 1 that's the
// per-request path. Without a router (no JS), the form GETs ?q= and the prod
// server 302s to the route.
export const PokemonSearch = ({
  names,
  action,
}: {
  names: string[];
  action: string;
}) => {
  const router = useOptionalRouter();
  return (
    <form
      className={styles["Search"]}
      method="get"
      action={action}
      onSubmit={(e) => {
        const slug = toSlug(String(new FormData(e.currentTarget).get("q") ?? ""));
        if (!slug || !router) return;
        e.preventDefault();
        router.navigate(`${action}${slug}/`);
      }}
    >
      <input
        name="q"
        list="pokemon-names"
        className={styles["SearchInput"]}
        placeholder="Any Pokémon — try one beyond gen 1"
        aria-label="Look up a Pokémon by name"
        autoComplete="off"
      />
      <datalist id="pokemon-names">
        {names.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <button type="submit" className={styles["SearchButton"]}>
        Look up
      </button>
    </form>
  );
};
