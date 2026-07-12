"use client";
import * as React from "react";
import type { ReactNode } from "react";
import { startClient } from "vite-plugin-react-server/router/client";
import { ErrorBoundary } from "./components/ErrorBoundary.client.js";
import "./css/globalStyles.css";

/**
 * bidoof client entry.
 *
 * vprs's `startClient` is the supplied client entry: it assembles the headless
 * router, initial-flight hydration (consuming the payload inlined into the
 * document on first paint — the static build's baked flight and /todos' live
 * per-request flight alike), client-side navigation, and RSC HMR. The whole
 * hand-rolled App / popstate / refetch / hydrateRoot boilerplate collapses to
 * this one call; the ErrorBoundary is injected through `wrap`.
 *
 * Navigation flows through <Link> (pushState + popstate), which the router
 * listens for; scroll-to-top on a click lives in <Link>. No `patterns` are
 * needed — bidoof reads no route params via useParams.
 */
startClient({
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
  wrap: (node: ReactNode) => <ErrorBoundary>{node}</ErrorBoundary>,
});
