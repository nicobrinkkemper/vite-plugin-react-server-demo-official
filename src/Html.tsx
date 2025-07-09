import React from "react";
import { Css, type HtmlProps } from "vite-plugin-react-server/components";

export const Html = ({
  Root,
  cssFiles,
  globalCss,
  pageProps = {},
  Page,
}: HtmlProps) => {
  if (!pageProps.title) {
    pageProps.title = "No title";
  }
  return (
    <html>
      <head>
        <Css cssFiles={globalCss} />
      </head>
      <body>
        <Root
          as={"div"}
          id="root"
          cssFiles={cssFiles}
          Page={Page}
          pageProps={pageProps}
        />
      </body>
    </html>
  );
};
