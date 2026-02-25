import React, { use, useCallback, useState, useTransition } from "react";
import { createRoot } from "react-dom/client";
import { useEventListener } from "./hooks/useEventListener.js";
import "./css/globalStyles.css";
import { createReactFetcher } from "vite-plugin-react-server/utils";
import { useRscHmr } from "virtual:react-server/hmr";
import { ErrorBoundary } from "./components/ErrorBoundary.client.js";
// PUBLIC_ORIGIN is provided by vite-plugin-react-server/virtual types,
// but re-declared here for noPropertyAccessFromIndexSignature compatibility
declare global {
  interface ImportMetaEnv {
    readonly PUBLIC_ORIGIN: string;
  }
}
/**
 * Client-side React Server Components implementation
 *
 * This module handles:
 * 1. Initial hydration of server-rendered content
 * 2. Client-side navigation using RSC
 * 3. State management for RSC data
 * 4. Stream updates when files change
 */

/**
 * Main application shell component
 * Handles navigation and RSC data updates
 */
const Shell: React.FC<{
  data: React.Usable<React.ReactNode>;
}> = ({ data }) => {
  const [, startTransition] = useTransition();
  const [storeData, setStoreData] =
    useState<React.Usable<React.ReactNode>>(data);

  // Refetch RSC stream - used for both navigation and HMR
  const refetch = useCallback((url: string = window.location.pathname, scrollToTop = true) => {
    if (scrollToTop && "scrollTo" in window) window.scrollTo(0, 0);
    startTransition(() => {
      setStoreData(
        createReactFetcher({
          url,
          moduleBaseURL: import.meta.env.BASE_URL,
          publicOrigin: import.meta.env.PUBLIC_ORIGIN,
        })
      );
    });
  }, []);

  // Handle browser navigation
  useEventListener("popstate", (e) =>
    refetch(
      e instanceof PopStateEvent && e.state?.to
        ? e.state.to
        : window.location.pathname
    )
  );

  // HMR: refetch when server components change (no scroll, preserves position)
  useRscHmr((url) => refetch(url, false));

  const content = use(storeData);

  return <ErrorBoundary>{content as React.ReactNode}</ErrorBoundary>;
};
// Initialize the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(<Shell data={createReactFetcher({
  url: window.location.pathname,
  moduleBaseURL: import.meta.env.BASE_URL,
  publicOrigin: import.meta.env.PUBLIC_ORIGIN,
})} />);
