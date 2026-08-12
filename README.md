# Bidoof Template

A static-first Pokédex starter built on [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) — React Server Components with ESM, Vite, and React.

[See the example hosted on Github pages](https://nicobrinkkemper.github.io/vite-plugin-react-server-demo-official/)

The app is small on purpose; every route exists to show one capability:

| Route | Rendering | Shows |
| --- | --- | --- |
| `/` | static | server pages, layout, a client component (the walking Bidoof) |
| `/pokedex/` | static | all 1025 Pokémon as cards + client-side search over the full roster (a vendored name index served as a static asset) — prerendered from a committed dataset, no network at build time |
| `/pokedex/$name/` | **hybrid** | file-router dynamic params: every species is prerendered via `staticPaths`; **special forms (Megas, regional variants) render per request** on the same route, fetched live from PokéAPI |
| `/404/` | static | `notFound()` thrown from a loader |

The full dex — 1025 pages — prerenders in about 17 seconds. What stays dynamic are the alternate forms (Mega evolutions, regional variants, costumes): they render through the server's live path (`npm run demo`), flash-free, in a single Node isolate with no `--conditions` flag. On the static-only GitHub Pages deploy those URLs answer 404, which is the honest difference between the two render modes.

Also demonstrated:

- `"use server"` actions with a SQLite database — the ★ favorite button on every Pokémon page round-trips through the sealed action gate (persistence proven by the e2e suite via reload)
- Client-side navigation with typed routes (`Link` autocompletes the route patterns)
- Client / server boundary: error boundary, `useState`, hydration from the inlined flight payload
- Static site generation with "headless" `index.rsc` files next to fully static `index.html` files

The dataset is committed (`src/data/pokedex.json`) so builds are deterministic and offline; regenerate it with `node scripts/generate-pokedex.mjs`.

Clone the repository to see the development process in action.

## Features

- ⚡️ [Vite](https://vitejs.dev/) - Lightning fast build tool
- ⚛️ [React](https://react.dev/) - The library for web and native user interfaces
- 🎯 TypeScript support
- 🔄 Server-side rendering with React Server Components
- 🎨 CSS Modules support
- 🚀 Static build with RSC support
- 🛠️ Development and preview support

## Prerequisites

- Node.js (latest recommended)
- npm or yarn or pnpm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/nicobrinkkemper/vite-plugin-react-server-demo-official.git
cd vite-plugin-react-server-demo-official
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
# Server-first dev (RSC condition active in Node)
npm run dev:rsc

# Client-first dev (no RSC condition; Vite handles the boundary)
npm run dev:ssr
```

4. Build and preview the static site:

```bash
# Build (default base / origin)
npm run build

# Build the GitHub Pages variant (static-only: no per-request Pokémon, no favorites)
npm run build:gh

# Build + serve a local preview at http://localhost:4173
npm run preview
```

## Project Structure

```
project/
├── src/                     # Source files
├── public/                  # Static assets
├── .github/workflows/       # CI/CD (builds + deploys to GitHub Pages)
├── vite.config.ts           # Vite configuration
├── vite.react.config.ts     # Plugin configuration (router, pages, entry)
└── tsconfig.json            # TypeScript configuration
```

## Build Commands

The build is split into three passes — static prerender, client bundle, server bundle — and each pass has variants per environment (`dev`, `gh`, `preview`). The aggregate scripts compose them:

```bash
# Default (uses BASE_URL=/, PUBLIC_ORIGIN unset)
npm run build              # all three passes
npm run build:static       # prerender RSC + HTML only
npm run build:client       # client bundle (vite build --ssr)
npm run build:server       # server bundle (NODE_OPTIONS='--conditions=react-server')

# GitHub Pages variant (BASE_URL=/vite-plugin-react-server-demo-official/)
npm run build:gh

# Preview variant (BASE_URL set so vite preview serves correctly)
npm run build:preview
npm run preview            # build:preview + preview:start

# Full SSR demo: build + run the production node server
npm run demo               # http://localhost:3000
```

## Configuration

The project uses Vite configuration file:

### `vite.config.ts`

Adding `vite-plugin-react-server` to vite

### `vite.react.config.ts`

Configuration for the plugin this demo is for

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) - The core RSC plugin
- [Vite](https://vitejs.dev/) - The build tool that powers this template
- [React](https://react.dev/) - The UI library
- [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components) - The RSC specification
