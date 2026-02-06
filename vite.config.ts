import { defineConfig } from "vite";
import { vitePluginReactServer } from "vite-plugin-react-server";
import config from "./vite.react.config.ts";

export default defineConfig({
  plugins: vitePluginReactServer(config),
  optimizeDeps: {
    // Pre-bundle these for faster dev startup and to resolve linked package issues
    include: [
      "react-server-dom-esm/client.browser",
      "react-server-dom-esm/client",
    ],
  },
});
