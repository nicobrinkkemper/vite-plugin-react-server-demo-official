import { defineConfig } from "vite";
import { vitePluginReactServer } from "vite-plugin-react-server";
import { getCondition } from "vite-plugin-react-server/config";
import config from "./vite.react.config.ts";

export default defineConfig({
  plugins: vitePluginReactServer(config),
});

console.log("Building", getCondition(), process.env.VITE_MODE, process.env.VITE_SSR === 'true' ? "SSR" : "STATIC");
