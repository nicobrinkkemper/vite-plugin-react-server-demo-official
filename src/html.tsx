import React from "react";
import type { Manifest } from "vite";
export const Html = ({
  children,
  pageProps,
}: {
  children: React.ReactNode;
  pageProps: Record<string, any>;
  manifest: Manifest;
}) => {
  return (
    <html>
      <head>
        <title>{pageProps["title"]}</title>
        <meta name="description" content={pageProps["description"]} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
};
