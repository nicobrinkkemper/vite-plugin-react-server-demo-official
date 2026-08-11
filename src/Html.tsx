import React from "react";
import type { HtmlProps } from "vite-plugin-react-server/types";
import { Css, Root as DefaultRoot } from "vite-plugin-react-server/components";

export const Html: React.FC<HtmlProps> = ({
  Root = DefaultRoot,
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
        {/* Declared in the document: hosts that omit a charset header would
            otherwise mangle non-ASCII text ("Pokédex") and break hydration
            with React #418. */}
        <meta charSet="utf-8" />
        <Css cssFiles={globalCss} />
      </head>
      <body>
        {React.createElement(Root as React.ElementType, rootProps)}
      </body>
    </html>
  );
};
