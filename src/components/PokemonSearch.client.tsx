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
// On a static-only deploy the beyond-original results still show, but as
// full-page links tagged "server only": the click lands on the 404 page
// (which explains the two render modes) instead of hanging the router on a
// flight fetch the host can't answer.
export const PokemonSearch = ({
  namesHref,
  action,
  staticOnly,
}: {
  namesHref: string;
  action: string;
  /** Static-only deploy (GitHub Pages): only the prerendered originals are
   *  reachable client-side; other results become full-page "server only"
   *  links. */
  staticOnly?: boolean;
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
  const reachable = (entry: NameEntry) => !staticOnly || entry.id <= 151;

  return (
    <>
      <form
        className={styles["Search"]}
        method="get"
        action={action}
        onSubmit={(e) => {
          if (!router) return;
          e.preventDefault();
          const first = results[0];
          const target = first?.name ?? (staticOnly ? "" : q);
          if (!target) return;
          if (first && !reachable(first)) {
            window.location.assign(`${action}${target}/`);
            return;
          }
          router.navigate(`${action}${target}/`);
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
          {results.map((entry) => {
            const card = (
              <>
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
              </>
            );
            return (
              <li key={entry.id} className={styles["Card"]}>
                {reachable(entry) ? (
                  <Link to={`${action}${entry.name}/`} className={styles["CardLink"]}>
                    {card}
                  </Link>
                ) : (
                  <a href={`${action}${entry.name}/`} className={styles["CardLink"]}>
                    {card}
                    <span className={styles["ServerOnly"]}>server only</span>
                  </a>
                )}
              </li>
            );
          })}
          {results.length === 0 && (
            <li className={styles["NoResults"]}>No Pokémon match “{query}”</li>
          )}
        </ul>
      )}
    </>
  );
};
