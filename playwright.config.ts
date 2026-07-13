import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the demo's PRODUCTION server-action path.
 *
 * The build is done first (see the `test:e2e` script) — keeping it OUT of the
 * webServer command so we don't nest a Vite build under the browser process
 * tree. Playwright then starts the plain Node/Express prod server and drives a
 * real browser against it.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The Express prod server (src/server/index.ts), started with NO
    // `--conditions react-server` — deliberately. The single-isolate edge build
    // exists so production runs on plain Node; needing the flag here would mean
    // that promise is broken.
    //
    // The glob tolerates both the plain and the content-hashed entry name: which
    // one the server build emits has changed across plugin versions, and pinning
    // `index-*.js` silently stopped matching once it was emitted unhashed.
    // Plain Node, so it survives in the background; the build ran before this.
    command:
      "BASE_URL=/ PUBLIC_ORIGIN=http://localhost:3000 NODE_ENV=production node dist/server/server/index*.js",
    url: "http://localhost:3000/todos/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
