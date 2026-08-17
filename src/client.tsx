"use client";
import * as React from "react";
import type { ReactNode } from "react";
import { startClient } from "vite-plugin-react-server/router/client";
import { ErrorBoundary } from "./components/ErrorBoundary.client.js";
import "./css/globalStyles.css";

/**
 * Client entry.
 *
 * vprs's `startClient` is the supplied client entry: it assembles the headless
 * router, initial-flight hydration (consuming the payload inlined into the
 * document on first paint — the static build's baked flight and the per-request
 * live flight alike), client-side navigation, and RSC HMR. The `patterns` let
 * `useParams()` resolve `/pokedex/$name`; the ErrorBoundary is injected
 * through `wrap`.
 */
const router = startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
  patterns: ["/", "/pokedex", "/pokedex/$name", "/pokedex/gen/$gen", "/404"],
  wrap: (node: ReactNode) => <ErrorBoundary>{node}</ErrorBoundary>,
});

// Scroll to top when a navigation starts. Link's data-pending/aria-busy come
// from the router; this is the one navigation behavior the app adds itself.
let lastUrl = router.getState().url;
router.subscribe(() => {
  const { url } = router.getState();
  if (url !== lastUrl) {
    lastUrl = url;
    window.scrollTo(0, 0);
  }
});

// Typed navigation: `Link`'s `to` autocompletes these patterns (concrete paths
// like /pokedex/pikachu still type-check).
declare module "vite-plugin-react-server/router/client" {
  interface Register {
    routes: "/" | "/pokedex" | "/pokedex/$name" | "/pokedex/gen/$gen" | "/404";
  }
}
