import React from "react";
import type { HtmlProps } from "vite-plugin-react-server/types";
import { Css } from "./Css";

// NB: the document wrapper imports nothing from vite-plugin-react-server/components.
// Loading that barrel here degrades the whole document to a fragment (no <html>
// root) in the no-flag `vite build` (build:static:gh), so `Css` is a local copy
// and `Root` comes from props (the plugin supplies it) rather than a /components
// default. See src/Css.tsx.
export const Html: React.FC<HtmlProps> = ({
  Root,
  cssFiles,
  globalCss,
  pageProps = {},
  Page,
  as = "div",
}) => {
  if (!pageProps.title) {
    pageProps.title = "No title";
  }
  const rootProps = {
    as,
    id: "root",
    cssFiles,
    Page,
    pageProps,
  } as Record<string, unknown>;
  return (
    <html>
      <head>
        <Css cssFiles={globalCss} />
      </head>
      <body>
        {React.createElement(Root as React.ElementType, rootProps)}
      </body>
    </html>
  );
};
