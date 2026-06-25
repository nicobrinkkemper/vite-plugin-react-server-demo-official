import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToPipeableStream } from "react-server-dom-esm/server.node";
import { collectManifestCss } from "vite-plugin-react-server/helpers";
import { Css } from "vite-plugin-react-server/components";
import type { CssContent } from "vite-plugin-react-server/types";
import type { Manifest } from "vite";
import { Page as TodosPage } from "../page/todos/page.js";
import { props as todosProps } from "../page/todos/props.js";

/**
 * Worker-free dynamic flight for /todos.
 *
 * /todos is the demo's one dynamic route — its todo list is live, read per
 * request from SQLite. The DOCUMENT request is NOT rendered here: it falls
 * through to the prerendered static shell (see start.tsx), exactly as a CDN would
 * serve it. The client then hydrates by fetching this live flight, so the list is
 * current with NO html-worker in the loop.
 *
 * That's the portable shape: no worker_threads, no cross-condition HTML render —
 * the one thing edge runtimes can't do. The flight is produced in-process. To run
 * this same route on a true edge runtime (Vercel Edge / Cloudflare / Deno) the
 * only change is swapping renderToPipeableStream (Node streams) for vprs's
 * renderRscResponse (Web streams); the wiring is identical.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, "../.."); // dist/server/server → dist (holds client/ + static/)
const base = process.env.BASE_URL || "/";

// Page stylesheet resolved from the static build manifest so a client navigation
// into /todos brings its styles with the flight. collectManifestCss walks a start
// file's import graph for its emitted CSS (the same helper the build uses). Small
// stylesheets (<= inlineThreshold) ship as inline <style>, larger ones as a link.
const staticDir = path.join(buildDir, "static");
const manifest = JSON.parse(
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
const cssFiles = toCssMap(collectManifestCss(manifest, "src/css/todoStyles.module.css"));

void React; // JSX factory in scope for the build

/** The live /todos page as a bare flight the client decodes into #root. */
export async function renderTodosFlight() {
  const pageProps = await todosProps(); // live todos from SQLite
  return renderToPipeableStream(
    <>
      <TodosPage {...pageProps} />
      <Css cssFiles={cssFiles} />
    </>,
    base,
    { onError: (error: unknown) => console.error("[todos flight] error:", error) }
  );
}
