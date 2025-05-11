import React, { use, useCallback, useState, useTransition } from "react";
import { createRoot } from "react-dom/client";
import { useEventListener } from "./hooks/useEventListener.js";
import "./css/globalStyles.css";
import { createReactFetcher } from "vite-plugin-react-server/utils";
import { ErrorMessage } from "./components/ErrorMessage.js";
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
  data: React.Usable<unknown>;
}> = ({ data: initialServerData }) => {
  const [, startTransition] = useTransition();
  const [storeData, setStoreData] =
    useState<React.Usable<unknown>>(initialServerData);

  const navigate = useCallback((to: string) => {
    if ("scrollTo" in window) window.scrollTo(0, 0);
    const [withOutQuery, query] = to.split("?");
    startTransition(() => {
      // Create new RSC data stream
      setStoreData(
        createReactFetcher({
          url: to.endsWith("/")
            ? withOutQuery + "index.rsc"
            : withOutQuery + "/index.rsc",
        })
      );
    });
  }, []);

  // Handle browser navigation
  useEventListener("popstate", (e) => {
    if (e instanceof PopStateEvent && e.state?.to) {
      return navigate(e.state.to);
    } else {
      return navigate(window.location.pathname);
    }
  });

  const content = use(storeData);

  return <ErrorBoundary>{content as React.ReactNode}</ErrorBoundary>;
};
// Initialize the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const intitalData = createReactFetcher();

createRoot(rootElement).render(<Shell data={intitalData} />);

/**
 * Error boundary
 */
class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  };
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
    this.setState({
      hasError: true,
      error:
        error instanceof Error
          ? error
          : new Error("Error", {
              cause: error,
            }),
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <ErrorMessage
        error={{
          message: this.state.error?.message ?? "Unknown error",
          stack: this.state.error?.stack,
        }}
      />
    );
  }
}
