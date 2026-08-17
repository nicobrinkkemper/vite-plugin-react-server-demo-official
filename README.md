# Pokédex demo — vite-plugin-react-server

The official demo for [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server):
React Server Components as a Vite plugin, not a framework. One `vite build`
produces a fully static site, and the same artifacts serve dynamic
per-request renders when you put a server behind them.

**[Open the live demo](https://nicobrinkkemper.github.io/vite-plugin-react-server-demo-official/)** (GitHub Pages, the static-only deploy)

The app is small on purpose; every route exists to show one capability:

| Route | Rendering | Shows |
| --- | --- | --- |
| `/` | static | server pages, layout, a client component (the walking Bidoof) |
| `/pokedex/` | static | generation hub + client-side search over the full roster (a vendored name index served as a static asset) |
| `/pokedex/gen/$gen/` | static | one page per generation, enumerated by `staticPaths` from the committed dataset — no network at build time |
| `/pokedex/$name/` | **hybrid** | file-router dynamic params: every species is prerendered via `staticPaths`; **special forms (Megas, regional variants) render per request** on the same route, fetched live from PokéAPI |
| `/404/` | static | `notFound()` thrown from a loader |

## One build, three artifacts

`npm run build` runs a single `vite build --app` under the `react-server`
condition and emits everything both deploy modes need:

- **`dist/static`** — 1,037 prerendered pages (about two seconds on a
  laptop). Each page is a complete `index.html` with its RSC flight payload
  inlined, plus a headless `index.rsc` sibling. First paint hydrates from the
  inlined payload — no extra round-trip; client-side navigation fetches the
  target's `.rsc`.
- **`dist/client`** — the browser bundle: client components, the router, the
  flight decoder.
- **`dist/server` + `dist/server-edge`** — the production server bundle and a
  baked single-isolate render pair. The baked pair has server React resolved
  at build time, so per-request rendering needs **no `--conditions` flag and
  no worker threads** at runtime.

There is no framework server underneath. `src/server/start.tsx` is the
production server, in the repo, readable: it mounts the emitted artifacts and
answers everything else with the prerendered 404.

## Two deploys from the same build

- **GitHub Pages** serves `dist/static` as-is. Static-only: the prerendered
  dex works fully, and special-form URLs answer 404 — the honest difference
  between the modes, not papered over.
- **Cloudflare Workers** serves the same static snapshot as assets and routes
  everything else through the baked pair (`worker.mjs`), so special forms
  render per request, flash-free, in one isolate.

Both deploys ship from CI on every push to `main`.

## Also demonstrated

- `"use server"` actions with a SQLite database — the ★ favorite button on
  every Pokémon page round-trips through the sealed action gate (persistence
  proven by the e2e suite via reload)
- Client-side navigation with typed routes (`Link` autocompletes the route
  patterns and carries `data-pending`/`aria-busy` while the target's flight
  loads — the stale-page dimming is a few lines of CSS on those attributes)
- Client / server boundary: error boundary, `useState`, hydration from the
  inlined flight payload
- A Playwright e2e suite that runs against the real production build on every
  pull request

## Quick start

```bash
git clone https://github.com/nicobrinkkemper/vite-plugin-react-server-demo-official.git
cd vite-plugin-react-server-demo-official
npm install

npm run dev        # dev server (server-first: react-server condition in Node)
npm run dev:ssr    # dev server (client-first: Vite owns the boundary)

npm run build      # the full build: static + client + server + baked pair
npm run demo       # build, then run the production server at :3000
npm run preview    # build + serve the static output at :4173
npm test           # production build + Playwright e2e
```

The two dev modes are the same app under the two execution topologies the
plugin supports; switching between them is how you convince yourself the
boundary is real.

## Where things are configured

- **`vite.config.ts`** — ordinary Vite config; reads `BASE_URL` so one env
  var sets the deploy base everywhere (GitHub Pages runs under a subpath).
- **`vite.react.config.ts`** — the plugin config, and the file to read first:
  file-based routing with `staticPaths` (the prerender worklist), the flight
  transport, CSS handling, and the server entry are all declared there in
  40 lines.

The dataset is committed (`src/data/pokedex.json`) so builds are
deterministic and offline; regenerate it with
`node scripts/generate-pokedex.mjs`.

## Contributing

Contributions are welcome — pull requests run the full e2e suite in CI.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) - The core RSC plugin
- [Vite](https://vitejs.dev/) - The build tool that powers this template
- [React](https://react.dev/) - The UI library
- [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components) - The RSC specification
