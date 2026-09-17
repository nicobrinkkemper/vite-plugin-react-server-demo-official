"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import type { Likes } from "../server/actions/likeActions.server.js";
import styles from "../css/pokemon.module.css";

// An anonymous visitor id: made up once per browser and kept in
// localStorage. It travels with every like action, so the same browser can
// like a Pokémon once and take it back; a fresh profile is a fresh visitor.
// Cloudflare has no anonymous-identity primitive, and holding the id in the
// browser needs no cookie plumbing through the action on either host.
const VISITOR_KEY = "pokedex:visitor";
const visitorId = (): string => {
  try {
    const stored = localStorage.getItem(VISITOR_KEY);
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
};

export const LikeButton = ({
  name,
  toggleLike,
  getLikes,
}: {
  name: string;
  toggleLike: (name: string, visitor: string) => Promise<Likes>;
  getLikes: (name: string, visitor: string) => Promise<Likes>;
}) => {
  // null = unknown (before the first action round-trip, or no server to ask).
  const [likes, setLikes] = useState<Likes | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLikes(name, visitorId())
      .then((result) => {
        if (!cancelled) setLikes(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [getLikes, name]);

  if (likes === null) return null;

  return (
    <button
      type="button"
      className={styles["Like"]}
      aria-pressed={likes.liked}
      aria-label={likes.liked ? "Unlike" : "Like"}
      data-count={likes.count}
      onClick={() => {
        toggleLike(name, visitorId())
          .then(setLikes)
          .catch(() => {});
      }}
    >
      {likes.liked ? "♥" : "♡"}
      <span className={styles["LikeCount"]}>{likes.count}</span>
    </button>
  );
};
