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
- Static site generation capabilities with "headless" index.rsc files and fully static index.html files

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

2. Install dependencies and apply patches:

```bash
npm install
```

After installing new dependencies

```bash
npm run postinstall
```

3. Start the development server:

```bash
# For server-side development
npm run dev
NODE_OPTIONS='--conditions=react-server' npx vite

# Using the plugin's built-in rsc-worker
npm run start
npx vite
```

4. Build and preview

```bash
# To build the static site
npm run build
NODE_OPTIONS='--conditions=react-server' npx vite build

#
npx vite preview
```

## Project Structure

```
project/
├── src/              # Source files
├── public/           # Static assets
├── patches/          # Custom patches for React experimental features
├── .github/          # GitHub workflows
│   └── workflows/    # CI/CD configurations
├── vite.config.ts           # Client-side Vite configuration
├── vite.react.config.ts     # Shared React configuration
└── tsconfig.json            # TypeScript configuration
```

## Build Commands

```bash
# Build everything
npm run build

# Build client-side only
npm run build:client

# Build server-side and generate static files
npm run build:server
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
