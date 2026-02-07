import type { StreamPluginOptions } from "vite-plugin-react-server/types";

const createRouter = (file: "props.ts" | "page.tsx") => (url: string) => {
  switch (url) { 
    case "/bidoof":
      return `src/page/bidoof/${file}`;
    case "/404":
      return `src/page/404/${file}`;
    case "/error-example":
      return `src/page/error-example/${file}`;
    case "/":
      return `src/page/${file}`;
    case "/todos":
      return `src/page/todos/${file}`;
    default: {
      if (process.env.NODE_ENV === "development") {
        return `src/page/404/${file}`;
      }
      throw new Error(
        `Unknown route: ${typeof url === "string" ? url : JSON.stringify(url)}`
      );
    }
  }
};
console.log('process.env.VITE_GITHUB_PAGES', process.env.VITE_GITHUB_PAGES);
export default {
  moduleBase: "src",
  Page: createRouter("page.tsx"),
  props: createRouter("props.ts"),
  Html: "src/Html.tsx",
  verbose: false,
  moduleBasePath: "/",
  moduleBaseURL: process.env.BASE_URL || process.env.VITE_BASE_URL || "/",
  serverEntry: "src/server/index.ts",
  css: {
    inlineThreshold: 10000,
  },
  build: {
    pages: ["/", "/bidoof", "/404", "/todos", "/error-example"],
  }
} satisfies StreamPluginOptions;
