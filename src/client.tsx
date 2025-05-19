import React, { use, useCallback, useState, useTransition } from "react";
import { createRoot } from "react-dom/client";
import { useEventListener } from "./hooks/useEventListener.js";
import "./css/globalStyles.css";
import { createReactFetcher, env } from "vite-plugin-react-server/utils";
import { ErrorBoundary } from "./components/ErrorBoundary.client.js";
console.log(env)
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

  const navigate = useCallback((to: string) => {
    if ("scrollTo" in window) window.scrollTo(0, 0);
    startTransition(() => {
      // Create new RSC data stream
      setStoreData(
        createReactFetcher({
          url: to,
        })
      );
    });
  }, []);

  // Handle browser navigation
  useEventListener("popstate", (e) =>
    navigate(
      e instanceof PopStateEvent && e.state?.to
        ? e.state.to
        : window.location.pathname
    )
  );

  const content = use(storeData);

  return <ErrorBoundary>{content as React.ReactNode}</ErrorBoundary>;
};
// Initialize the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(<Shell data={createReactFetcher()} />);
