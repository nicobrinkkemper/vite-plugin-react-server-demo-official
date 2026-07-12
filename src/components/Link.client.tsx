"use client"

import React from "react";
export const Link: React.FC<{
  children: React.ReactNode;
  to?: string;
  href?: string;
  className?: string;
}> = ({ children, to, href, className, ...props }) => (
  <a
    {...props}
    className={className ?? ""}
    href={typeof href === 'string' ? href : to}
    onClick={(e) => {
      e.preventDefault();
      let localHref = href || to;
      const isBlank =
        localHref?.startsWith("http") ||
        (e.currentTarget &&
          "target" in e.currentTarget &&
          e.currentTarget.target.toLowerCase() === "_blank");
      
      const newTo =
        e.currentTarget && "href" in e.currentTarget
          ? e.currentTarget.href
          : localHref;

        if (isBlank) {
          if(newTo) window.location.href = newTo
        }
      const newState = { to: newTo };
      if(window.location.pathname !== newTo) {
        // Scroll-to-top on a real link click. The hand-rolled client's popstate
        // handler used to do this; startClient replaces that handler and does not
        // force scroll, so browser back/forward keep their restored position.
        if ("scrollTo" in window) window.scrollTo(0, 0);
        try {
          window.history.pushState(newState, "", e.currentTarget.href);
          window.dispatchEvent(new PopStateEvent("popstate", { state: newState }));
        } catch (error) {
          console.error(`You can not go to ${newTo}`, error);
        }
      }
    }}
  >
    {children}
  </a>
);
