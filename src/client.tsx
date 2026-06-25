import React, { useCallback, useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./css/globalStyles.css";
import { createReactFetcher } from "vite-plugin-react-server/utils";
import { useRscHmr } from "virtual:react-server/hmr";
import { ErrorBoundary } from "./components/ErrorBoundary.client.js";

/**
 * Client-side React Server Components entry.
 *
 * Initial render: the route's flight is taken from the inline payload baked into
 * the document when present (the static build inlines it; the dynamic /todos
 * document inlines its live per-request flight — see server/start.tsx), else
 * fetched as `.rsc`. Either way it's decoded to a ReactNode BEFORE mount, rendered
 * directly — a synchronous first render with no Suspense boundary so hydrateRoot
 * matches the server markup. (use()-ing the pending thenable, or wrapping the
 * root in a client-only <Suspense> the server never rendered, mismatches the
 * prerender → React #418.)
 *
 * Navigation / HMR: fetch the target route's flight, await the decode, then
 * swap it in within a transition — keeping the current page visible, still with
 * no Suspense boundary.
 */
const App: React.FC<{ initialNode: ReactNode }> = ({ initialNode }) => {
  const [content, setContent] = useState<ReactNode>(initialNode);
  const [, startTransition] = useTransition();

  const go = useCallback((url: string, scrollToTop = true) => {
    if (scrollToTop && "scrollTo" in window) window.scrollTo(0, 0);
    Promise.resolve(
      createReactFetcher({
        url,
        moduleBaseURL: import.meta.env.BASE_URL,
        publicOrigin: import.meta.env.PUBLIC_ORIGIN,
      })
    )
      .then((node) => startTransition(() => setContent(node as ReactNode)))
      .catch(() => {
        /* superseded by a later navigation — that render wins */
      });
  }, []);

  // Browser + <Link> navigation (Link dispatches popstate with state.to).
  useEffect(() => {
    const onPopState = (e: PopStateEvent) =>
      go(e.state?.to ?? window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [go]);

  // HMR: refetch the current route when server components change (no scroll).
  useRscHmr((url) => go(url, false));

  return <ErrorBoundary>{content}</ErrorBoundary>;
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Fully resolve the initial payload (dynamic flight-client import + decode) to a
// node, then mount: hydrateRoot when the server sent prerendered/SSR'd markup,
// createRoot for an empty (JS-rendered) shell.
Promise.resolve(
  createReactFetcher({
    url: window.location.pathname,
    moduleBaseURL: import.meta.env.BASE_URL,
    publicOrigin: import.meta.env.PUBLIC_ORIGIN,
  })
).then(
  (initialNode) => {
    if (rootElement.hasChildNodes()) {
      hydrateRoot(rootElement, <App initialNode={initialNode as ReactNode} />);
    } else {
      createRoot(rootElement).render(
        <App initialNode={initialNode as ReactNode} />
      );
    }
  },
  (error) => {
    // Stay on the server-rendered HTML rather than mounting a broken tree.
    console.error("[bidoof] initial RSC payload failed to load", error);
  }
);
