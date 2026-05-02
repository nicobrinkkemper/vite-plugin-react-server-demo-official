# Bidoof Template

A modern React application template using [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) for React Server Components (RSC) support.

[See the example hosted on Github pages](https://nicobrinkkemper.github.io/vite-plugin-react-server-demo-official/)

Showcasing:

- Client / Server boundary
  - Client side Error Boundary
  - Client side navigation
  - Server side page & props
  - Counter with useState
  - Dynamic head updates
  - Async props using the pokeapi
  - Todo page using server actions and a SQLite database (local only — disabled on the GitHub Pages build, since it has no server)
- Static site generation capabilities with "headless" index.rsc files and fully static index.html files
  - Static result includes server actions results

Clone the repository to see the development process in action.

- Showing server side stack trace in ErrorBoundary
- Open Developer console for additional stack-trace information on the error-example page
- Hot reloading of pages

## Features

- ⚡️ [Vite](https://vitejs.dev/) - Lightning fast build tool
- ⚛️ [React](https://react.dev/) - The library for web and native user interfaces
- 🎯 TypeScript support
- 🔄 Server-side rendering with React Server Components
- 📡 Built-in API fetching utilities
- 🎨 CSS Modules support
- 🔧 Experimental React patch setup
- 🚀 Static build with RSC support
- 🛠️ Development and preview support
- 👷 Worker support for RSC and HTML generation

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

# Build the GitHub Pages variant (the todo page is replaced with a stub here)
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
