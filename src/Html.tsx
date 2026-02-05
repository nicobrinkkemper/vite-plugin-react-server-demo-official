import React from "react";
import type { HtmlProps } from "vite-plugin-react-server/types";
import { Css, Root as DefaultRoot } from "vite-plugin-react-server/components";

export const Html: React.FC<HtmlProps> = ({
  Root = DefaultRoot,
  cssFiles,
  globalCss,
  pageProps,
  Page,
  as = "div",
}) => {
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
