import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToPipeableStream } from "react-server-dom-esm/server.node";
import { createInlineFlightRenderer } from "vite-plugin-react-server/stream";
import { collectManifestCss } from "vite-plugin-react-server/helpers";
import { Css } from "vite-plugin-react-server/components";
import type { CssContent } from "vite-plugin-react-server/types";
import type { Manifest } from "vite";
import { Html } from "../Html.js";
import { Page as TodosPage } from "../page/todos/page.js";
import { props as todosProps } from "../page/todos/props.js";

/**
 * Flash-free dynamic SSR for /todos.
 *
 * /todos renders per request with the LIVE database todos. On a document load the
 * page is rendered to HTML with the matching flight inlined, so the browser
 * hydrates the server markup in place — current todos in the initial HTML, zero
 * index.rsc refetch, no flash. On a client navigation (the .rsc request) the same
 * live page is streamed as a bare flight. Both are the runtime counterpart to the
 * static build's build-time inlineFlight.
 *
 * vprs ships createInlineFlightRenderer for the document path: it owns the
 * html-worker lifecycle, the full + headless dual flight, and the manifest →
 * bootstrap wiring, so the demo only supplies its Html, the page, and live props.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, "../.."); // dist/server/server → dist (holds client/ + static/)
const base = process.env.BASE_URL || "/";

// Stylesheets resolved from the static build manifest so the SSR'd document is
// styled before the client bundle loads. collectManifestCss walks a start file's
// import graph for its emitted CSS — the same helper the build uses to derive
// per-page vs app-shell CSS (react-static/processCssFilesForPages):
//   - cssFiles: the /todos page stylesheet, rendered inside #root.
//   - globalCss: the app-shell stylesheets reachable from the html entry, in <head>.
const staticDir = path.join(buildDir, "static");
const manifest = JSON.parse(
  fs.readFileSync(path.join(staticDir, ".vite/manifest.json"), "utf-8")
) as Manifest;
// Inline a stylesheet whose content is at/under css.inlineThreshold (10_000 in
// vite.react.config.ts) as a <style>, and link larger ones — mirroring what
// createCssProps does in the build. Inlining the small demo CSS means the SSR
// document carries the styles directly, with no external <link>/preload (the
// preloads React emitted for the linked form were being dropped with an invalid
// `as`).
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
const globalCss = toCssMap(collectManifestCss(manifest, "index.html"));

// One long-lived inline-flight renderer (own html-worker), reused across requests.
const renderer = createInlineFlightRenderer({ Html, buildDir, base });

/** Document request: the live page as HTML with its flight inlined (hydrate in place). */
export async function renderTodosHtml() {
  const pageProps = await todosProps(); // live todos from SQLite
  return renderer.render({ route: "/todos", Page: TodosPage, props: pageProps, cssFiles, globalCss });
}

/** Navigation request: the live page flight the client decodes into #root. */
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
