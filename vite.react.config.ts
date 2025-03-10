import type { StreamPluginOptions } from "vite-plugin-react-server/server";
import { InlineCssCollector } from "vite-plugin-react-server/components";
import { Html } from "./src/html";

const createRouter = (file: "props.ts" | "page.tsx") => (url: string) => {
  switch (url) {
    case "/bidoof":
    case "/bidoof/index.rsc":
      return `src/page/bidoof/${file}`;
    case "/404":
    case "/404/index.rsc":
      return `src/page/404/${file}`;
    case "/":
    case "/index.rsc":
      return `src/page/${file}`;
    default:
      throw new Error(`Unknown route: ${url}`);
  }
};

const files = {};
const tap = (fn: (...args: any[]) => any) => {
  return (...args2: any[]) => {
    const result = fn(...args2);
    if (!files[args2[0]]) {
      files[args2[0]] = [result];
    } else {
      files[args2[0]].push(result);
      console.log(args2[0], "\n", files[args2[0]].join("\n "), "\n");
    }
    return result;
  };
};

export const config = {
  moduleBase: "src",
  Page: tap(createRouter("page.tsx")),
  props: tap(createRouter("props.ts")),
  Html: Html,
  inlineCss: true,
  build: {
    pages: ["/", "/bidoof", "/404"	],
    client: "client",
    server: "server",
    static: "static",
    outDir: "dist",
    assetsDir: "assets",
  },
} satisfies StreamPluginOptions;
