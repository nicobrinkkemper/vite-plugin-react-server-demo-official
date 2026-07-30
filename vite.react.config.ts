import type { StreamPluginOptions } from "vite-plugin-react-server/types";

console.log('process.env.VITE_GITHUB_PAGES', process.env.VITE_GITHUB_PAGES);
export default {
  moduleBase: "src",
  // File-based routing in one field: scans src/page/** for page.tsx (+ sibling
  // props.ts) and derives Page / props / routePatterns / the prerender
  // worklist. All five routes are static, so build.pages is discovered from
  // the tree — no more hand-rolled url switch to keep in sync.
  routes: { dir: "page" },
  Html: "src/Html.tsx",
  verbose: false,
  moduleBasePath: "/",
  // No moduleBaseURL: vprs ≥3.2.3 takes Vite's `base` (vite.config.ts reads
  // BASE_URL), so the deploy base is configured once.
  publicOrigin: process.env.PUBLIC_ORIGIN || "",
  serverEntry: "src/server/index.ts",
  css: {
    inlineThreshold: 10000,
  },
  build: {
    // The single-isolate edge bundle (dist/server-edge/render.js, server React
    // inlined) is ON by default — it's what lets /todos render flash-free per
    // request in ONE isolate, no html-worker and no runtime `--conditions
    // react-server` (see src/server/start.tsx). Pass `edge: false` to opt out.
  }
} satisfies StreamPluginOptions;
