import { defineConfig, devices } from "@playwright/test";

/**
 * The static build as GitHub Pages serves it: under a subpath, no server
 * behind it. `test:e2e:subpath` builds first, then this serves dist/static
 * with `vite preview`.
 */
export const BASE = "/vite-plugin-react-server-demo-official/";

export default defineConfig({
  testDir: "./e2e-subpath",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:4173", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview:start -- --port 4173 --strictPort",
    url: `http://localhost:4173${BASE}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
