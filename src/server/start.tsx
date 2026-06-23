import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable, PassThrough } from "node:stream";
import { createRequestHandler, toNodeListener } from "vite-plugin-react-server/helpers";
import {
  renderTodosHtml,
  renderTodosFlight,
} from "./renderTodosWithInlineFlight.server.js";

/**
 * Production server for the demo, on the vprs 2.9.0 serving API.
 *
 * vite-plugin-react-server now ships an opinion on serving: createRequestHandler
 * is a Web-standard (Request) => Response server for a build. It serves the
 * prerendered files from dist/static, dispatches "use server" actions through the
 * SEALED production gate (handleServerAction — the verified prod trust boundary,
 * an allowlist that rejects any action id the build did not emit), and calls our
 * render() hook for the one dynamic route. toNodeListener adapts it to node:http
 * (or Express middleware, or any Fetch runtime — Hono, Bun, Deno).
 *
 * Only /todos is dynamic: a document load gets the live page as HTML with its
 * flight inlined (hydrate in place, no flash, no refetch); a client navigation
 * (the index.rsc request) gets the live page flight. Every other route falls
 * through to its prerendered file.
 *
 * Run:
 *   rm -f todos.db && PUBLIC_ORIGIN='http://localhost:3000' BASE_URL='/' npm run build
 *   NODE_ENV=production NODE_OPTIONS='--conditions react-server' node dist/server/server/index-*.js
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../.."); // dist/server/server → repo root
const staticDir = path.resolve(__dirname, "../../static"); // prerendered build output
const base = process.env.BASE_URL || "/";
const port = 3000;

/** Pipe a Node RSC/HTML stream into a Web Response body. */
const streamResponse = (
  stream: { pipe: (dest: NodeJS.WritableStream) => unknown },
  contentType: string
): Response => {
  const pass = new PassThrough();
  stream.pipe(pass);
  return new Response(Readable.toWeb(pass) as ReadableStream, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-cache" },
  });
};

const handler = createRequestHandler({
  staticDir,
  // Sealed production action gate; serverManifest auto-loaded from dist/server.
  action: { projectRoot, base },
  // The only dynamic route. createReactFetcher requests "<route>/index.rsc" with
  // Accept: text/x-component for a navigation; a document load has neither.
  render: async (pathname, request) => {
    const route = pathname.replace(/\/index\.rsc$|\.rsc$|\/$/, "");
    if (route !== "/todos") return null;
    const wantsFlight =
      pathname.endsWith(".rsc") ||
      (request.headers.get("accept") ?? "").includes("text/x-component");
    try {
      return wantsFlight
        ? streamResponse(await renderTodosFlight(), "text/x-component; charset=utf-8")
        : streamResponse(await renderTodosHtml(), "text/html; charset=utf-8");
    } catch (error) {
      // Degrade to the prerendered shell (stale todos) rather than 500 — return
      // null so createRequestHandler serves the build's static file for the route.
      console.error("[/todos] dynamic render failed, serving prerendered shell:", error);
      return null;
    }
  },
});

http.createServer(toNodeListener(handler)).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Static files served from: ${staticDir}`);
});
