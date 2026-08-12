// Cloudflare Worker entry: the per-request half of the deploy.
//
// The prerendered snapshots in dist/static are served by the assets binding
// BEFORE this worker runs, so only misses land here — a Pokémon that wasn't
// prerendered, its .rsc payload on client navigation, and server actions.
// Everything below uses the baked pair alone (dist/server-edge): importing
// vite-plugin-react-server subpaths here would drag node builtins into the
// bundle, and the pair needs none.
import * as bundle from "./dist/server-edge/render.js";
import { renderFlightToHtml } from "./dist/server-edge/consumer.js";

const RSC_SUFFIX = /\/index\.rsc$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    try {
      if (request.method === "POST" && request.headers.get("x-rsc-action")) {
        return await bundle.handleRouteAction(request);
      }

      if (RSC_SUFFIX.test(url.pathname)) {
        const route = url.pathname.replace(RSC_SUFFIX, "/");
        const { headless } = await bundle.renderRouteToDocument(route, {
          request,
        });
        return new Response(headless, {
          headers: { "content-type": "text/x-component; charset=utf-8" },
        });
      }

      const { full } = await bundle.renderRouteToDocument(url.pathname, {
        request,
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
