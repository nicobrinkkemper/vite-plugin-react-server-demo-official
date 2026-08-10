"use client";
import * as React from "react";
import { Link as RouterLink, useOptionalRouter } from "vite-plugin-react-server/router/client";

const emptySubscribe = () => () => {};
const getEmpty = () => "";
const strip = (p: string) => p.replace(/\/+$/, "") || "/";

// vprs router Link (typed `to` via the Register declaration in client.tsx,
// intent-prefetch on hover, external/modified-click passthrough, plain <a>
// during static prerender) plus the template's transition state: the router
// swaps resolve-then-set, so after a click the old page stays mounted while
// the target's flight loads — during that window the clicked link carries
// `data-pending`/aria-busy and the page is styled as stale (globalStyles.css).
// The indicator leaves the tree with the old page when the swap lands.
export const Link: typeof RouterLink = ({ onClick, ...props }) => {
  const router = useOptionalRouter();
  const subscribe = router ? router.subscribe : emptySubscribe;
  const getUrl = router ? () => router.getState().url : getEmpty;
  const location = React.useSyncExternalStore(subscribe, getUrl, getUrl);
  const [initial] = React.useState(location);
  const [clicked, setClicked] = React.useState(false);

  const pending =
    clicked && location !== initial && strip(location) === strip(props.to);

  return (
    <RouterLink
      {...props}
      data-pending={pending || undefined}
      aria-busy={pending || undefined}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        setClicked(true);
        if ("scrollTo" in window) window.scrollTo(0, 0);
      }}
    />
  );
};
