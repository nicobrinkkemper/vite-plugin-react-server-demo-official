import type { StreamPluginOptions } from "vite-plugin-react-server/types";
import { getCondition } from "vite-plugin-react-server/config";
import pokedex from "./src/data/pokedex.json" with { type: "json" };

export default {
  // This demo deliberately runs BOTH topologies from one config (dev:rsc vs
  // dev:ssr, build vs build:static), so the declared runner tracks the
  // launching script's condition. A single-topology app declares a literal
  // "main" or "isolated" instead. Required from vite-plugin-react-server 4.0.
  runner: getCondition() === "react-server" ? ("main" as const) : ("isolated" as const),
  moduleBase: "src",
  // File-based routing in one field: scans src/page/** for page.tsx (+ sibling
  // props.ts) and derives Page / props / routePatterns / the prerender
  // worklist. The dynamic /pokedex/$name route prerenders every vendored
  // species; any other name resolves per request on the server.
  routes: {
    dir: "page",
    staticPaths: {
      "/pokedex/$name": () => pokedex.map((p: { name: string }) => ({ name: p.name })),
      "/pokedex/gen/$gen": () =>
        Array.from({ length: 9 }, (_, i) => ({ gen: String(i + 1) })),
    },
  },
  Html: "src/Html.tsx",
  verbose: false,
  moduleBasePath: "/",
  // No moduleBaseURL: vprs ≥3.2.3 takes Vite's `base` (vite.config.ts reads
  // BASE_URL), so the deploy base is configured once.
  publicOrigin: process.env.PUBLIC_ORIGIN || "",
  // One flight flavor for the whole deploy: snapshots freeze through the
  // baked webpack pair and the same pair renders per request, so CDN copies
  // (GitHub Pages included — vprs >=3.10.1 resolves chunk urls against the
  // deploy's base) and the Cloudflare Worker serve interchangeably.
  transport: "webpack",
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
