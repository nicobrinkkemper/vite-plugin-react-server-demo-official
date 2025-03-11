import { defineConfig, Plugin } from "vite";
import { vitePluginReactClient } from "vite-plugin-react-server/client";
import { config } from "./vite.react.config";

export default defineConfig({
  plugins: vitePluginReactClient(config) as Plugin[],
});
