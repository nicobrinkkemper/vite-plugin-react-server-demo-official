import React from "react";
import type { HtmlProps } from "vite-plugin-react-server/types";
import { CssCollectorElements } from "vite-plugin-react-server/components";
export const Html = ({
  children,
  CssCollector,
  cssFiles,
  globalCss,
  moduleBasePath,
}: React.PropsWithChildren<HtmlProps>) => (
  <html>
    <head>
      {moduleBasePath !== "" && <base href={moduleBasePath} />}
      <CssCollectorElements cssFiles={globalCss} />
    </head>
    <body>
      <CssCollector as={"div"} id="root" cssFiles={cssFiles}>
        {children}
      </CssCollector>
    </body>
  </html>
);
