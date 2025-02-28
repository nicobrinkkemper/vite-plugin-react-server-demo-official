import type { StreamPluginOptions } from "vite-plugin-react-server/server";
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
const tap = (fn: (...args: any[]) => any) => {
  return (...args: any[]) => {
    const result = fn(...args);
    console.log(args, "->", result);
    return result;
  };
};

export const config = {
  moduleBase: "src",
  Page: tap(createRouter("page.tsx")),
  props: tap(createRouter("props.ts")),
  Html: Html,
  build: {
    pages: ["/", "/404", "/bidoof"],
    client: "client",
    server: "server",
    static: "static",
    outDir: "dist",
    assetsDir: "assets",
  },
} satisfies StreamPluginOptions;
