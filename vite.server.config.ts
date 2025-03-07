import { defineConfig, Plugin } from "vite";
// @ts-ignore
import { vitePluginReactServer } from "vite-plugin-react-server";
import { config } from "./vite.react.config";

export default defineConfig({
  plugins: vitePluginReactServer(config) as Plugin[],
});
