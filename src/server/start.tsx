import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable, PassThrough } from "node:stream";
import { createRequestHandler, toNodeListener } from "vite-plugin-react-server/helpers";
import { renderTodosFlight } from "./renderTodosFlight.server.js";

/**
 * Production server for the demo — worker-free, edge-portable serving.
 *
 * createRequestHandler is vprs's Web-standard (Request) => Response server for a
 * build. It serves the prerendered files from dist/static, dispatches "use
 * server" actions through the SEALED production gate (handleServerAction — the
 * verified prod trust boundary, an allowlist that rejects any action id the build
 * did not emit), and calls our render() hook for the one dynamic route.
 * toNodeListener adapts it to node:http (or Express middleware, or any Fetch
 * runtime — Hono, Bun, Deno).
 *
 * Only /todos is dynamic, and ONLY its flight is. A document load falls through
 * to the prerendered static shell (what a CDN serves); the client then fetches
 * this route's live flight and hydrates the current todos into #root. There is no
 * html-worker and no cross-condition HTML render — nothing here that an edge
 * runtime can't do. This is the shape that ports unchanged to Vercel Edge /
 * Cloudflare / Deno (swap the in-process flight renderer for vprs's Web one).
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
    // Worker-free: only the live flight is dynamic. The document request returns
    // null and createRequestHandler serves the prerendered static shell, which the
    // client hydrates by fetching this same live flight — no html-worker.
    if (!wantsFlight) return null;
    try {
      return streamResponse(await renderTodosFlight(), "text/x-component; charset=utf-8");
    } catch (error) {
      // Degrade to the prerendered shell (build-time todos) rather than 500 —
      // return null so createRequestHandler serves the build's static file.
      console.error("[/todos] dynamic flight failed, serving prerendered shell:", error);
      return null;
    }
  },
});

http.createServer(toNodeListener(handler)).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Static files served from: ${staticDir}`);
});
