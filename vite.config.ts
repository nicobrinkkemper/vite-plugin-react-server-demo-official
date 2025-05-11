import { defineConfig } from "vite";
// @ts-ignore
import { vitePluginReactServer } from "vite-plugin-react-server";
import { Html } from "vite-plugin-react-server/components";


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
      if(process.env.NODE_ENV === 'development'){
        return `src/page/404/${file}`;
      }
      throw new Error(`Unknown route: ${typeof url === "string" ? url : JSON.stringify(url)}`);
    }
  }
};
process.env.GITHUB_ACTIONS = "true";
export default defineConfig({
  plugins: vitePluginReactServer({
    moduleBase: "src",
    Page: createRouter("page.tsx"),
    props: createRouter("props.ts"),
    serverEntry: "src/server.tsx",
    clientEntry: "src/client.tsx",
    moduleBaseURL: process.env.GITHUB_ACTIONS ? "/vite-plugin-react-server-demo-official/" : "/",
    moduleBasePath: "",
    Html: Html,
    build: {
      pages: ["/", "/bidoof", "/404", "/error-example"],
      // below are redundant, already the default
      preserveModulesRoot: true,
      hash: "hash",
      outDir: "dist",
      client: "client",
      server: "server",
      static: "static",
    }
  }),
});
