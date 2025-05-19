import { Html } from "./src/Html.tsx";
import type { StreamPluginOptions } from "vite-plugin-react-server/types";

const createRouter = (file: "props.ts" | "page.tsx") => (url: string) => {
  switch (url) { 
    case "/bidoof":
    case "/bidoof/index.rsc":
      return `src/page/bidoof/${file}`;
    case "/404":
    case "/404/index.rsc":
      return `src/page/404/${file}`;
    case "/error-example":
    case "/error-example/index.rsc":
      return `src/page/error-example/${file}`;
    case "/":
    case "/index.rsc":
      return `src/page/${file}`;
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

export default {
  moduleBase: "src",
  Page: createRouter("page.tsx"),
  props: createRouter("props.ts"),
  Html: Html,
  build: {
    pages: ["/", "/bidoof", "/404", "/error-example"],
  },
} satisfies StreamPluginOptions;
