import React, { PropsWithChildren } from "react";
import { type HtmlProps } from "vite-plugin-react-server/types";
import { CssCollectorElements } from "vite-plugin-react-server/components";
/**
 * Just for testing purposes and as example to show how to use the Html component
 */
export const Html = ({ children, cssFiles }: PropsWithChildren<HtmlProps>) => (
  <html>
    <head>
      <CssCollectorElements cssFiles={cssFiles} />
    </head>
    <body>
      <div id="root">{children}</div>
    </body>
  </html>
);
