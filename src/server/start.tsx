import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  createRequestHandler,
  toNodeListener,
} from "vite-plugin-react-server/request-handler";
import { collectManifestCss } from "vite-plugin-react-server/helpers";
import { createEdgeHandler } from "vite-plugin-react-server/stream/client";
import type { CssContent } from "vite-plugin-react-server/types";
import type { Manifest } from "vite";

/**
 * Production server for the demo — single-isolate, worker-free, NO `--conditions`.
 *
 * /todos is the one dynamic route: its todos are live (SQLite, per request), so
 * its document is rendered per request rather than served as the prerendered
 * shell. The render runs in ONE isolate via the baked edge bundle
 * (dist/server-edge/render.js, server React inlined) + createEdgeHandler:
 *
 *   - document load  → full flash-free HTML with the live todos AND the matching
 *     headless flight inlined (<script id="vprs-flight">), so the client hydrates
 *     in place with no index.rsc round-trip.
 *   - client nav (.rsc) → the live headless flight for #root.
 *
 * Because the renderer runs client React in-process (the baked bundle holds the
 * server React), the process needs NO `NODE_OPTIONS=--conditions react-server`
 * and no html-worker — the shape that ports to an edge runtime. Every other
 * route falls through to its prerendered static file. "use server" actions go
 * through the sealed production gate (createRequestHandler `action`).
 *
 * Run:
 *   rm -f todos.db && PUBLIC_ORIGIN='http://localhost:3000' BASE_URL='/' npm run build
 *   NODE_ENV=production node dist/server/server/index-*.js
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, "../.."); // dist/server/server → dist
const staticDir = path.join(buildDir, "static");
const projectRoot = path.resolve(__dirname, "../../.."); // dist/server/server → repo root
const base = process.env.BASE_URL || "/";
const port = 3000;

// The in-process HTML render decodes the flight under client React and resolves
// client-component references by importing them from the ssr bundle (dist/client)
// on disk — so the renderer's moduleBaseURL is that directory as a file URL, NOT
// the browser's HTTP base. The browser hydrates from its own base separately.
const ssrModuleBaseURL = pathToFileURL(path.join(buildDir, "client")).href + "/";

// Page CSS for /todos, resolved from the static manifest (the same collection
// the build uses). Small sheets inline as <style>, larger ones as a <link>, so
// a per-request render carries its styles. Passed into the baked document
// renderer so the full HTML and the inline flight agree.
const staticManifest = JSON.parse(
  fs.readFileSync(path.join(staticDir, ".vite/manifest.json"), "utf-8")
) as Manifest;
const INLINE_THRESHOLD = 10_000;
const toCssMap = (inputs: Record<string, string>): Map<string, CssContent> =>
  new Map(
    Object.values(inputs).map((file) => {
      const code = fs.readFileSync(path.join(staticDir, file), "utf-8");
      const content: CssContent =
        code.length <= INLINE_THRESHOLD
          ? { id: file, as: "style", type: "text/css", children: code }
          : { id: file, as: "link", rel: "stylesheet", href: base + file, precedence: "high" };
      return [file, content];
    })
  );
const todosCss = toCssMap(
  collectManifestCss(staticManifest, "src/css/todoStyles.module.css")
);

// Client bootstrap entry (for hydration) from the static manifest.
const clientEntry = staticManifest["index.html"]?.file;
const bootstrapModules = clientEntry ? [base + clientEntry] : [];

type RenderRouteToDocument = (
  url: string,
  opts?: { cssFiles?: Map<string, CssContent> }
) => Promise<{
  full: ReadableStream<Uint8Array>;
  headless: ReadableStream<Uint8Array>;
}>;
type HandleRouteAction = (
  request: Request,
  opts?: { projectRoot?: string }
) => Promise<Response>;

async function main() {
  // The baked single-isolate edge bundle — server React inlined, so importing it
  // here (no `--conditions`) is fine; the rest of this process runs client React.
  // It also carries the baked server-action gate, so the action dispatch never
  // disk-imports the react-server transport either.
  const edgeBundlePath = path.resolve(buildDir, "server-edge", "render.js");
  const { renderRouteToDocument, handleRouteAction } = (await import(
    pathToFileURL(edgeBundlePath).href
  )) as {
    renderRouteToDocument: RenderRouteToDocument;
    handleRouteAction: HandleRouteAction;
  };

  // Flash-free /todos document: full inline-flight HTML in one isolate.
  const todosDocument = createEdgeHandler({
    renderDocument: () => renderRouteToDocument("/todos", { cssFiles: todosCss }),
    moduleBaseURL: ssrModuleBaseURL,
    bootstrapModules,
    getURL: () => "/todos",
  });

  const handler = createRequestHandler({
    staticDir,
    // Sealed production action gate — the BAKED one (a function), so the process
    // dispatches actions with no `--conditions react-server` and no on-disk
    // transport import.
    action: (request) => handleRouteAction(request, { projectRoot }),
    render: async (pathname, request) => {
      const route = pathname.replace(/\/index\.rsc$|\.rsc$|\/$/, "");
      if (route !== "/todos") return null;
      const wantsFlight =
        pathname.endsWith(".rsc") ||
        (request.headers.get("accept") ?? "").includes("text/x-component");
      try {
        if (wantsFlight) {
          // Client navigation: live headless flight (Page + route CSS) for #root.
          const { headless } = await renderRouteToDocument("/todos", {
            cssFiles: todosCss,
          });
          return new Response(headless as unknown as BodyInit, {
            headers: {
              "Content-Type": "text/x-component; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          });
        }
        // Document load: full flash-free HTML with live todos + inline flight.
        return await todosDocument(request);
      } catch (error) {
        // Degrade to the prerendered shell (build-time todos) rather than 500.
        console.error("[/todos] dynamic render failed, serving prerendered shell:", error);
        return null;
      }
    },
  });

  const listener = toNodeListener(handler);
  http
    .createServer((req, res) => {
      Promise.resolve(listener(req, res)).catch((error) => {
        console.error("[server] request failed:", error);
        if (!res.headersSent) res.statusCode = 500;
        res.end("Internal Server Error");
      });
    })
    .listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Static files served from: ${staticDir}`);
    });
}

main().catch((error) => {
  console.error("[server] failed to start:", error);
  process.exit(1);
});
