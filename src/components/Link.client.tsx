"use client";
import * as React from "react";
import { Link as RouterLink } from "vite-plugin-react-server/router/client";

// vprs router Link (typed `to` via the Register declaration in client.tsx,
// intent-prefetch on hover, external/modified-click passthrough, plain <a>
// during static prerender) plus the template's one addition: scroll to top on
// a real link click. startClient doesn't force scroll, so back/forward keep
// their browser-restored position.
export const Link: typeof RouterLink = ({ onClick, ...props }) => (
  <RouterLink
    {...props}
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
      if ("scrollTo" in window) window.scrollTo(0, 0);
    }}
  />
);
