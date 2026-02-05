import { getCondition } from "vite-plugin-react-server/config";
export { ErrorBoundary } from "./ErrorBoundary.client.js";

const condition = getCondition("");
if (condition !== "server") {
  throw new Error(
    "The error boundary is not supported in non react-server condition"
  );
}
