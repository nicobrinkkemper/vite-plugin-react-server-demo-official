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
  moduleBaseURL: "https://nicobrinkkemper.github.io/vite-plugin-react-server-demo-official/",
  build: {
    pages: ["/", "/bidoof", "/404"	],
    // below are redundant, already the default
    preserveModulesRoot: true, 
    hash: "hash",
    outDir: "dist",
    client: "client",
    server: "server",
    static: "static",
  },
  moduleBasePath: "",
  inlineCss: true,
} satisfies StreamPluginOptions;
