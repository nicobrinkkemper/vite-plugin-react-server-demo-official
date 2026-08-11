import type { StreamPluginOptions } from "vite-plugin-react-server/types";
import pokedex from "./src/data/pokedex.json" with { type: "json" };

export default {
  moduleBase: "src",
  // File-based routing in one field: scans src/page/** for page.tsx (+ sibling
  // props.ts) and derives Page / props / routePatterns / the prerender
  // worklist. The dynamic /pokedex/$name route prerenders the 151 vendored
  // gen-1 Pokémon; any other name resolves per request on the server.
  routes: {
    dir: "page",
    staticPaths: {
      "/pokedex/$name": () => pokedex.map((p: { name: string }) => ({ name: p.name })),
    },
  },
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
    // inlined) is ON by default — it's what lets non-prerendered Pokémon render
    // flash-free per request in ONE isolate, no html-worker and no runtime
    // `--conditions react-server` (see src/server/start.tsx). Pass
    // `edge: false` to opt out.
  }
} satisfies StreamPluginOptions;
