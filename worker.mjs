// Cloudflare Worker entry: the per-request half of the deploy.
//
// The worker runs first (wrangler.jsonc: run_worker_first) and answers a
// GET/HEAD from the prerendered snapshots in dist/static through the ASSETS
// binding; only misses render here — a Pokémon that wasn't prerendered and
// its .rsc payload on client navigation. Server actions POST to the page they
// sit on, prerendered or not, which is why assets cannot go first: the asset
// would answer the POST with 405 and the action would never run.
// Everything below uses the baked pair alone (dist/server-edge): importing
// vite-plugin-react-server subpaths here would drag node builtins into the
// bundle, and the pair needs none.
//
// Bindings (the FAVORITES D1 database, see wrangler.jsonc) arrive per request
// on `env`. The pair forwards everything after the request as `platform`:
// loaders see it as `ctx.platform`, and every server action gets a trailing
// `{ platform }` argument — that is how the favorites action reaches D1 here
// while the same code runs on node:sqlite under Node.
import * as bundle from "./dist/server-edge/render.js";
import { renderFlightToHtml } from "./dist/server-edge/consumer.js";

const RSC_SUFFIX = /\/index\.rsc$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const platform = [env, ctx];
    try {
      if (request.method === "POST" && request.headers.get("x-rsc-action")) {
        return await bundle.handleRouteAction(request, { platform });
      }

      if (request.method === "GET" || request.method === "HEAD") {
        const snapshot = await env.ASSETS.fetch(request);
        if (snapshot.status !== 404) return snapshot;
      }

      if (RSC_SUFFIX.test(url.pathname)) {
        const route = url.pathname.replace(RSC_SUFFIX, "/");
        const { headless } = await bundle.renderRouteToDocument(route, {
          request,
          platform,
        });
        return new Response(headless, {
          headers: { "content-type": "text/x-component; charset=utf-8" },
        });
      }

      const { full } = await bundle.renderRouteToDocument(url.pathname, {
        request,
        platform,
      });
      const html = await renderFlightToHtml({
        rscStream: full,
        bootstrapModules: bundle.bootstrapModules,
        // The transport hint the client entry reads to pick its flight
        // decoder — prerendered documents carry it from the freeze; a
        // per-request document must stamp it itself.
        bootstrapScriptContent: 'self.__vprsFlightTransport="webpack";',
      });
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e) {
      if (/unknown route|not.*baked|no route/i.test(String(e?.message ?? e))) {
        return new Response("Not found", { status: 404 });
      }
      console.error(e);
      return new Response("Render error", { status: 500 });
    }
  },
};
