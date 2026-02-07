import { defineConfig } from "vite";
import { vitePluginReactServer } from "vite-plugin-react-server";
import { getCondition } from "vite-plugin-react-server/config";
import config from "./vite.react.config.ts";
console.log(getCondition());
export default defineConfig({
  base: process.env.BASE_URL || "/",
  plugins: vitePluginReactServer(config),
});
