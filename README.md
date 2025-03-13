# Bidoof Template

A modern React application template using [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) for React Server Components (RSC) support.

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
npm run patch  # Applies necessary React experimental patches
```

3. Start the development server:
```bash
# For server-side development
NODE_OPTIONS="--conditions=react-server" npm run dev

# For client-side development
npm run dev:client
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
├── vite.server.config.ts    # Server-side configuration
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

The project uses three Vite configuration files:

### `vite.config.ts` (Client)
Handles client-side bundling and ESM modules using `vite-plugin-react-server/client`.

### `vite.server.config.ts` (Server)
Manages server-side rendering and RSC processing using `vite-plugin-react-server`.

### `vite.react.config.ts` (Shared)
Contains shared configuration for both client and server builds.

## React Server Components

The template includes utilities for working with React Server Components. Here's an example of how to use the `createReactFetcher`:

```typescript
import { createReactFetcher } from './utils/createReactFetcher';

// Create a fetcher with default options
const component = await createReactFetcher();

// Or with custom options
const component = await createReactFetcher({
  url: '/api/component',
  moduleBaseURL: 'https://your-base-url.com',
  headers: { Accept: 'text/x-component' }
});
```

## Worker Support

The template leverages two types of workers from vite-plugin-react-server:

- **RSC Worker**: Handles server-side component streaming
- **HTML Worker**: Manages client-side HTML generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [vite-plugin-react-server](https://github.com/nicobrinkkemper/vite-plugin-react-server) - The core RSC plugin
- [Vite](https://vitejs.dev/) - The build tool that powers this template
- [React](https://react.dev/) - The UI library
- [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components) - The RSC specification
