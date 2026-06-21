import { PassThrough } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import React from "react";
import { renderToPipeableStream } from "react-server-dom-esm/server.node";
import { createWorker } from "vite-plugin-react-server/worker";
import { createHtmlStreamWithInlineFlight } from "vite-plugin-react-server/stream";
import { Css } from "vite-plugin-react-server/components";
import type { CssContent } from "vite-plugin-react-server/types";
import { Html } from "../Html.js";
import { Page as TodosPage } from "../page/todos/page.js";
import { props as todosProps } from "../page/todos/props.js";

/**
 * Flash-free dynamic SSR for /todos (vite-plugin-react-server bd-7vy / epic qmi).
 *
 * The static build ships /todos/index.html with the BUILD-TIME todo list baked
 * in and no inline flight, so the browser shows stale todos, then createRoot +
 * createReactFetcher fetches the live list and swaps it in: a visible flash and
 * an index.rsc round-trip on every load.
 *
 * Here we render the page per request with the LIVE database todos and embed the
 * matching flight payload into the HTML (createHtmlStreamWithInlineFlight), so
 * the browser hydrates the server markup in place — current todos in the initial
 * HTML, zero refetch, no flash. This is the dynamic-SSR counterpart to the
 * static build's build-time inlineFlight.
 *
 * vprs has no opinion on serving (see start.tsx), so the wiring lives here:
 *  - One long-lived HTML worker (react-client condition) does the RSC→HTML SSR,
 *    exactly as the static build's html-worker does — bidoof just runs it per
 *    request instead of per build.
 *  - Two flights from the SAME live props: the FULL Html/Root-wrapped flight is
 *    streamed to the worker → HTML document; the HEADLESS (Page-only) flight is
 *    the payload the client decodes into #root. Same props → matching markup →
 *    clean hydrate.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// dist/server/server/* → the sibling build outputs.
const projectRoot = path.resolve(__dirname, "../../.."); // node_modules lives here
const staticDir = path.resolve(__dirname, "../../static"); // browser assets + manifest
// The HTML worker must resolve "use client" chunks from the --ssr client build
// (dist/client), NOT the browser bundle (dist/static). dist/client externalizes
// react/react-dom as bare specifiers, so they resolve to the SAME vendored React
// the worker's react-dom/server uses; the dist/static chunks bundle their own
// React copy, which gives a null hook dispatcher (two Reacts) during SSR.
const clientDir = path.resolve(__dirname, "../../client");
const base = process.env.BASE_URL || "/";

const manifest = JSON.parse(
  fs.readFileSync(path.join(staticDir, ".vite/manifest.json"), "utf-8")
) as Record<string, { file: string; css?: string[]; isEntry?: boolean }>;

function cssEntry(id: string, file: string | undefined): [string, CssContent][] {
  return file
    ? [[id, { id, href: base + file, as: "link", rel: "stylesheet", precedence: "high" }]]
    : [];
}
// The page stylesheet (matches the build's /todos css link) and the global
// stylesheet, so the SSR'd document is styled before the client bundle loads.
const cssFiles = new Map<string, CssContent>(
  cssEntry("todoStyles", manifest["src/css/todoStyles.module.css"]?.css?.[0])
);
const globalCss = new Map<string, CssContent>(
  cssEntry("globalStyles", manifest["src/css/globalStyles.css"]?.file)
);
// The client entry React must bootstrap, so the hydrating script ships in the
// SSR HTML (the build injects the same module into the static index.html).
const bootstrapModules = manifest["index.html"]?.file
  ? [base + manifest["index.html"].file]
  : [];

// One HTML worker, created on the first dynamic request and reused. It runs in
// the react-client condition (react-dom/server lives there) opposite this
// server's react-server condition — createWorker handles the condition flip.
let htmlWorkerPromise: Promise<unknown> | null = null;
function getHtmlWorker(): Promise<unknown> {
  if (!htmlWorkerPromise) {
    htmlWorkerPromise = createWorker({
      projectRoot,
      currentCondition: "react-server",
      reverseCondition: "react-client",
      mode: "production",
      workerData: {
        userOptions: {
          verbose: false,
          clientPipeableStreamOptions: {},
          // Required: createWorker does setTimeout(reject, <this>) for the READY
          // handshake; left undefined the timer fires on the next tick and the
          // worker "times out" before it can even start.
          htmlWorkerStartupTimeout: 30_000,
        },
        resolvedConfig: { logLevel: "info" },
      },
    }).then((res: any) => {
      if (res.type !== "success") {
        htmlWorkerPromise = null;
        throw res.error ?? new Error("HTML worker failed to start");
      }
      return res.worker;
    });
  }
  return htmlWorkerPromise;
}

/** Buffer a flight render to its raw bytes (the inline payload). */
function collectFlight(render: { pipe: (d: NodeJS.WritableStream) => unknown }): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new PassThrough();
    sink.on("data", (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    sink.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    sink.on("error", reject);
    render.pipe(sink);
  });
}

/**
 * Render /todos to an HTML stream with the live flight inlined. Pipe it to the
 * Express response for a document (full-page) request.
 */
export async function renderTodosHtml(): Promise<{
  pipe: <W extends NodeJS.WritableStream>(destination: W) => W;
  abort: (reason?: unknown) => void;
}> {
  const htmlWorker = await getHtmlWorker();
  const pageProps = await todosProps(); // live todos from SQLite

  // FULL flight: the whole document (Html > Root > Page + Css) → HTML worker.
  const fullSink = new PassThrough();
  renderToPipeableStream(
    <Html Page={TodosPage} pageProps={pageProps} cssFiles={cssFiles} globalCss={globalCss} as="div" />,
    base,
    { onError: (error: unknown) => console.error("[todos full flight] error:", error) }
  ).pipe(fullSink);

  // HEADLESS flight: page content only — exactly what the client renders into
  // #root, mirroring the RSC endpoint (renderRSC) so the inline payload is
  // byte-for-byte what createReactFetcher would otherwise fetch.
  const inlineFlight = collectFlight(
    renderToPipeableStream(
      <>
        <TodosPage {...pageProps} />
        <Css cssFiles={cssFiles} />
      </>,
      base,
      { onError: (error: unknown) => console.error("[todos headless flight] error:", error) }
    )
  );

  return createHtmlStreamWithInlineFlight({
    route: "/todos",
    id: "/todos",
    htmlWorker,
    rscStream: fullSink,
    inlineFlight,
    moduleRootPath: clientDir,
    moduleBaseURL: base,
    moduleBasePath: "/",
    projectRoot: clientDir,
    clientPipeableStreamOptions: { bootstrapModules },
    verbose: false,
  } as Parameters<typeof createHtmlStreamWithInlineFlight>[0]);
}
