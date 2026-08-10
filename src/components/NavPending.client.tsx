"use client";
import * as React from "react";
import { useOptionalRouter } from "vite-plugin-react-server/router/client";
import { matchRoutes } from "vite-plugin-react-server/router";
import styles from "../css/navPending.module.css";

const PATTERNS = ["/", "/pokedex", "/pokedex/$name", "/404"];

/**
 * Proof-of-work indicator for client-side navigation. The router keeps the old
 * view mounted while the next route's flight is fetched (resolve-then-set), but
 * `useLocation()` moves to the target immediately — so from inside the OLD
 * page, "location differs from the location I mounted with" IS the pending
 * window. The component unmounts with the old tree when the swap lands, and
 * each page keys it by its own url so a same-route navigation (pokemon →
 * pokemon) remounts it instead of inheriting a stale baseline.
 */
export const NavPending = () => {
  const router = useOptionalRouter();
  const subscribe = router ? router.subscribe : emptySubscribe;
  const getUrl = router ? () => router.getState().url : getEmpty;
  const location = React.useSyncExternalStore(subscribe, getUrl, getUrl);
  const [initial] = React.useState(location);
  if (!router || location === initial) return null;

  const target = matchRoutes(PATTERNS, location);
  const name = target?.pattern === "/pokedex/$name" ? target.params.name : null;
  return (
    <>
      <span className={styles["Bar"]} />
      <span className={styles["Chip"]} role="status">
        {name ? `Catching ${name}…` : "Loading…"}
      </span>
    </>
  );
};

const emptySubscribe = () => () => {};
const getEmpty = () => "";
