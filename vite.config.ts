import { defineConfig } from "vite";
import { vitePluginReactServer } from "vite-plugin-react-server";
import config from "./vite.react.config.ts";

export default defineConfig({
  plugins: vitePluginReactServer(config),
});
