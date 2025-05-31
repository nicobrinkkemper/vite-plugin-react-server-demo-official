import React from "react";
import type { HtmlProps } from "vite-plugin-react-server/types";
import { CssCollectorElements } from "vite-plugin-react-server/components";

export const Html = ({
  children,
  CssCollector,
  cssFiles,
  globalCss,
  pageProps,
  Page,
  moduleBaseURL,
}: React.PropsWithChildren<HtmlProps>) => (
  <html>
    <head>
      <CssCollectorElements cssFiles={globalCss} />
    </head>
    <body>
      <CssCollector
        as={"div"}
        id="root"
        cssFiles={cssFiles}
        Page={Page}
        pageProps={pageProps}
      />
    </body>
  </html>
);
