import { Css, type HtmlProps } from "vite-plugin-react-server/components";
import React from "react";

type BidoofTemplateHtmlProps = HtmlProps<
  {
    title: string;
  },
  boolean, // both style/link types
  "div", // Root can have any props also valud for 'div'
  React.ReactNode // Use this React.React return type 
>;

export const Html = ({
  Root,
  cssFiles,
  globalCss,
  pageProps = {
    title: "No title",
  },
  as = "div" as "div",
  Page,
}: BidoofTemplateHtmlProps) => {
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
          as={as}
          id="root"
          cssFiles={cssFiles}
          Page={Page}
          pageProps={pageProps}
        />
      </body>
    </html>
  );
};
