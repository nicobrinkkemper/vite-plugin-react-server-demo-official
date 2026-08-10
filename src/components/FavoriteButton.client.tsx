"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import styles from "../css/pokemon.module.css";

export const FavoriteButton = ({
  name,
  toggleFavorite,
  getFavorites,
}: {
  name: string;
  toggleFavorite: (name: string) => Promise<{ favorite: boolean }>;
  getFavorites: () => Promise<string[]>;
}) => {
  // null = unknown (before the first action round-trip, or no server to ask).
  const [favorite, setFavorite] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFavorites()
      .then((names) => {
        if (!cancelled) setFavorite(names.includes(name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [getFavorites, name]);

  if (favorite === null) return null;

  return (
    <button
      type="button"
      className={styles["Favorite"]}
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      onClick={() => {
        toggleFavorite(name)
          .then((result) => setFavorite(result.favorite))
          .catch(() => {});
      }}
    >
      {favorite ? "★" : "☆"}
    </button>
  );
};
