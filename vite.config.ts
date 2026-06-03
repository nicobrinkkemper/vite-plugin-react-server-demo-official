import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitePluginReactServer } from "vite-plugin-react-server";
import { getCondition } from "vite-plugin-react-server/config";
import config from "./vite.react.config.ts";

export default defineConfig({
  base: process.env.BASE_URL || "/",
  // `react()` MUST come before vitePluginReactServer(): it adds React Fast
  // Refresh for client components (state-preserving hot updates), while vprs
  // owns server-component HMR (RSC refetch). See vprs docs/maintenance.
  plugins: [react(), ...vitePluginReactServer(config)],
  optimizeDeps: {
    // Pre-bundle these for faster dev startup and to resolve linked package issues
    include: [
      "react-server-dom-esm/client.browser",
      "react-server-dom-esm/client",
    ],
  },
});

console.log("Building", getCondition(), process.env.VITE_MODE, process.env.VITE_SSR === 'true' ? "SSR" : "STATIC");
