"use client";
import * as React from "react";
import { useOptionalRouter } from "vite-plugin-react-server/router/client";
import { Link } from "./Link.client.js";
import { sprite } from "../lib/sprites.js";
import { toSlug } from "../lib/slug.js";
import styles from "../css/pokedex.module.css";

type NameEntry = { id: number; name: string };

const MAX_RESULTS = 24;

// Search over EVERY Pokémon, statically: the full name+id index is a build
// artifact (public/names.json) fetched once on mount, matches render as the
// same icon cards as the grid below, and each card links into
// /pokedex/$name — prerendered for the originals, per request beyond them.
export const PokemonSearch = ({
  namesHref,
  action,
}: {
  namesHref: string;
  action: string;
}) => {
  const router = useOptionalRouter();
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<NameEntry[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(namesHref)
      .then((res) => (res.ok ? res.json() : []))
      .then((names: NameEntry[]) => {
        if (!cancelled) setIndex(names);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [namesHref]);

  const q = toSlug(query);
  const results = q
    ? index.filter((entry) => entry.name.includes(q)).slice(0, MAX_RESULTS)
    : [];

  return (
    <>
      <form
        className={styles["Search"]}
        method="get"
        action={action}
        onSubmit={(e) => {
          if (!router) return;
          e.preventDefault();
          const target = results[0]?.name ?? q;
          if (target) router.navigate(`${action}${target}/`);
        }}
      >
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles["SearchInput"]}
          placeholder="Search any Pokémon…"
          aria-label="Search Pokémon by name"
          autoComplete="off"
        />
      </form>
      {q && (
        <ul className={styles["Results"]} aria-label="search results">
          {results.map((entry) => (
            <li key={entry.id} className={styles["Card"]}>
              <Link to={`${action}${entry.name}/`} className={styles["CardLink"]}>
                <img
                  src={sprite(entry.id)}
                  alt={entry.name}
                  width={96}
                  height={96}
                  loading="lazy"
                />
                <span className={styles["CardId"]}>
                  #{String(entry.id).padStart(3, "0")}
                </span>
                <span className={styles["CardName"]}>{entry.name}</span>
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className={styles["NoResults"]}>No Pokémon match “{query}”</li>
          )}
        </ul>
      )}
    </>
  );
};
