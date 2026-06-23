import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createInlineFlightRenderer } from "vite-plugin-react-server/stream";
import type { CssContent } from "vite-plugin-react-server/types";
import { Html } from "../Html.js";
import { Page as TodosPage } from "../page/todos/page.js";
import { props as todosProps } from "../page/todos/props.js";

/**
 * Flash-free dynamic SSR for /todos.
 *
 * /todos renders per request with the LIVE database todos and inlines the
 * matching flight payload, so the browser hydrates the server markup in place —
 * current todos in the initial HTML, zero index.rsc refetch, no flash. It is the
 * runtime counterpart to the static build's build-time inlineFlight.
 *
 * vprs ships createInlineFlightRenderer for exactly this: it owns the html-worker
 * lifecycle, the full + headless dual flight, and the manifest → bootstrap wiring,
 * so the demo only supplies its Html, the page component, and the live props.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, "../.."); // dist/server/server → dist (holds client/ + static/)
const base = process.env.BASE_URL || "/";

// The page + global stylesheet links, matched from the static build manifest so
// the SSR'd document is styled before the client bundle loads (the same links the
// build bakes into /todos/index.html).
const manifest = JSON.parse(
  fs.readFileSync(path.join(buildDir, "static/.vite/manifest.json"), "utf-8")
) as Record<string, { file: string; css?: string[] }>;
const link = (id: string, href: string | undefined): CssContent | undefined =>
  href ? { id, href: base + href, as: "link", rel: "stylesheet", precedence: "high" } : undefined;
const collect = (...entries: (readonly [string, CssContent | undefined])[]) =>
  new Map<string, CssContent>(
    entries.filter((e): e is [string, CssContent] => e[1] !== undefined)
  );
const cssFiles = collect(["todoStyles", link("todoStyles", manifest["src/css/todoStyles.module.css"]?.css?.[0])]);
const globalCss = collect(["globalStyles", link("globalStyles", manifest["src/css/globalStyles.css"]?.file)]);

// One long-lived inline-flight renderer (own html-worker), reused across requests.
const renderer = createInlineFlightRenderer({ Html, buildDir, base });

/** Render /todos to an HTML stream with the live flight inlined. */
export async function renderTodosHtml() {
  const pageProps = await todosProps(); // live todos from SQLite
  return renderer.render({ route: "/todos", Page: TodosPage, props: pageProps, cssFiles, globalCss });
}
