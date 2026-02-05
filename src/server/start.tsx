import express from "express";
import { renderToPipeableStream } from "react-server-dom-esm/server.node";
import React from "react";
import { Page as TodosPage } from "../page/todos/page.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { props as todosProps } from "../page/todos/props.js";
import { Css } from "vite-plugin-react-server/components";
import type { CssContent } from "vite-plugin-react-server/types";

/**
 * Purpose of this demo is to to show how to use the bundled modules from vite-plugin-react-server
 * to serve a specific use case: the dynamic todo page functionality of the demo app.
 *
 * We can run this script using the following commands:
 * ```bash
 * # clean up database and build the project
 * rm todos.db && PUBLIC_ORIGIN='http://localhost:3000' BASE_URL='/' npm run build
 * # run the server
 * NODE_ENV=production NODE_OPTIONS='--conditions react-server' node dist/server/server/start.js
 * ```
 * Because the vite-plugin-react-server has no opinion on how to serve your application,
 * you need to write all this code yourself. It can be express, which seems to be popular these days
 * but of course there are many other options.
 *
 * The plugin only cares about transforming the modules for each boundary, and this module is one of those
 * that can also be used as the entry point for a server.
 *
 * For html pages it streams files directly from the static directory, which is like us saying that these
 * pages are static and never change.
 *
 * The todo page is made to show-off the server-action functionality - which of course won't work on
 * Github pages - but it will work just fine if you know how to setup a server and setup streams based on header/url information
 * depending on your use cases.
 */

interface ManifestEntry {
  file: string;
  name?: string;
  src?: string;
  isEntry?: boolean;
  imports?: string[];
  css?: string[];
}


const app = express();
const base = import.meta.env.BASE_URL || "/";
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, "../../static");
const serverRoot = path.resolve(__dirname, "../");

// Load manifests
const manifest = JSON.parse(
  fs.readFileSync(path.join(staticDir, ".vite/manifest.json"), "utf-8")
) as Record<string, ManifestEntry>;
const serverManifest = JSON.parse(
  fs.readFileSync(path.join(serverRoot, ".vite/manifest.json"), "utf-8")
) as Record<string, ManifestEntry>;


// Configuration for page handling
const pageConfig = {
  // Dynamic pages that need server-side rendering
  dynamic: {
    "/todos": {
      component: TodosPage,
      getProps: todosProps,
      cssFiles: new Map([
        [
          "todoStyles",
          {
            id: "todoStyles",
            // the most accurate way to get the css file from vite is to always add it as an entry, which the plugin does,
            // and then look up the final css files for that entry.
            // which in our case is just one file;
            href: base + manifest["src/css/todoStyles.module.css"]?.css![0],
            as: "link",
            rel: "stylesheet",
            precedence: "high",
          } satisfies CssContent,
        ],
      ]),
    },
  },
  // Static pages that are pre-rendered
  static: ["/", "/bidoof", "/error-example", "/404"],
} as const;
// Build a map of all valid static files
const validFiles = new Set<string>();
Object.values(manifest).forEach((entry) => {
  validFiles.add(entry.file);
  // allow css files to be requested.
  entry.css?.forEach((css) => validFiles.add(css));
});

// Build a map of all valid server files
const validServerFiles = new Set<string>();
Object.entries(serverManifest).forEach(([, entry]) => {
  validServerFiles.add(entry.file);
  // allow css files to be requested.
  entry.css?.forEach((css) => validServerFiles.add(css));
});

// routes we are going to be handling for this app.
const routes = ["/", "/bidoof", "/error-example", "/todos", "/404"];
// add index.rsc and index.html for each route to make the lookup easier.
// these are generated after the build so they are not in the manifest.
for (const route of routes) {
  const rscPath = path.join(route, "index.rsc").slice(1);
  const htmlPath = path.join(route, "index.html").slice(1);
  validServerFiles.add(rscPath);
  validServerFiles.add(htmlPath);
}

// Debug logging middleware
app.use((req, res, next) => {
  console.log("Request details:", {
    url: req.url,
    method: req.method,
    accept: req.headers.accept,
    "sec-fetch-dest": req.headers["sec-fetch-dest"],
    "sec-fetch-mode": req.headers["sec-fetch-mode"],
    "sec-fetch-site": req.headers["sec-fetch-site"],
    "user-agent": req.headers["user-agent"],
  });
  next();
});

// Serve static files with manifest validation
app.use(async (req, res, next) => {
  const url = req.url.slice(1); // Remove leading slash

  // Handle server actions
  if (req.method === "POST") {
    console.log("Handling server action:", url);
    // Parse the action ID from the request body
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { id, args } = JSON.parse(body);
        const actionName = id.split("#")[1];
        const actionKey = id.split("#")[0];

        // it should be the actual file name.
        const hasAction = validServerFiles.has(actionKey.slice(base.length));
        if (!hasAction) {
          throw new Error(`Action not found in manifest: ${actionKey}`);
        }

        console.log("Loading action:", actionKey.slice(base.length), actionName);
        const actionModule = await import(
          path.join(serverRoot, actionKey.slice(base.length))
        );
        const result = await actionModule[actionName](...args);

        // Use renderToPipeableStream for the action result
        res.setHeader("Content-Type", "text/x-component; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");

        const { pipe } = renderToPipeableStream(result, base, {
          onError(error) {
            console.error("Server action RSC Error:", error);
            res.statusCode = 500;
            res.end("Internal Server Error");
          },
        });

        pipe(res);
      } catch (error) {
        console.error("Server action error:", error);
        res.status(500).json({ error: "Server action failed" });
      }
    });
    return;
  }

  // If it's a valid static file, serve it
  if (validFiles.has(url)) {
    console.log("Serving static file:", url);
    // Set Content-Type based on file extension and fetch destination
    if (url.endsWith(".js") || req.headers["sec-fetch-dest"] === "script") {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    } else if (url.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    } else if (url.endsWith(".ico")) {
      res.setHeader("Content-Type", "image/x-icon; charset=utf-8");
    }
    res.sendFile(path.join(staticDir, url));
    return;
  }

  // If Accept header is text/x-component, handle RSC
  if (req.headers.accept?.includes("text/x-component")) {
    // Remove index.rsc and .rsc extensions for path matching
    const pathWithoutExt = url
      .replace(/\/index\.rsc$/, "") // Remove /index.rsc at the end
      .replace(/\.rsc$/, ""); // Remove .rsc at the end

    // Check if this is a dynamic page
    const dynamicPage = pageConfig.dynamic[`/${pathWithoutExt}`];
    if (dynamicPage) {
      console.log("Rendering dynamic RSC for:", pathWithoutExt);
      await renderRSC(
        res,
        dynamicPage.component,
        await dynamicPage.getProps(),
        dynamicPage.cssFiles
      );
      return;
    }

    // For all other routes, serve static RSC file
    console.log("Serving static RSC file for:", url);
    const rscPath = url.endsWith(".rsc") ? url : url + ".rsc";

    // Validate RSC file exists in validServerFiles
    if (!validServerFiles.has(rscPath)) {
      console.error("Static RSC file not found:", rscPath);
      res.status(404).send("RSC file not found");
      return;
    }

    serveRSCFile(res, rscPath);
    return;
  }

  // Check if this is a dynamic page
  const dynamicPage = pageConfig.dynamic[`/${url}`];
  if (dynamicPage) {
    console.log("Treating as dynamic route:", url);
    next();
    return;
  }

  // If it's a fetch request (empty dest) and not a static file, treat it as RSC
  if (
    req.headers["sec-fetch-dest"] === "empty" &&
    req.headers["sec-fetch-mode"] === "cors"
  ) {
    console.log("Treating as RSC (fetch request):", url);
    next();
    return;
  }

  // If it's not a static file and has no extension, treat it as RSC
  if (!url.includes(".")) {
    console.log("Treating as RSC (no extension):", url);
    next();
    return;
  }

  // For everything else, try to serve index.html
  console.log("Serving index.html for:", url);
  res.sendFile("index.html", { root: staticDir });
});

// Helper function to handle RSC rendering
const renderRSC = async (
  res: express.Response,
  Component: React.ComponentType<any>,
  props: any,
  cssFiles: Map<string, CssContent>
) => {
  res.setHeader("Content-Type", "text/x-component; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  const { pipe } = renderToPipeableStream(
    <>
      <Component {...props} />
      <Css cssFiles={cssFiles} />
    </>,
    base,
    {
      onError(error) {
        console.error("RSC Error:", error);
        res.statusCode = 500;
        res.end("Internal Server Error");
      },
    }
  );

  pipe(res);
};

// Helper function to serve pre-rendered RSC files
const serveRSCFile = (res: express.Response, filePath: string) => {
  res.setHeader("Content-Type", "text/x-component; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  const fullPath = path.join(staticDir, filePath);
  res.sendFile(fullPath);
};

const serveHTMLFile = (res: express.Response, filePath: string) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const fullPath = path.join(staticDir, filePath);
  res.sendFile(fullPath);
};

// Dynamic route handlers
Object.entries(pageConfig.dynamic).forEach(
  ([path, { component, getProps, cssFiles }]) => {
    app.get(path, async (req, res) => {
      if (
        req.headers["sec-fetch-dest"] === "empty" &&
        req.headers["sec-fetch-mode"] === "cors"
      ) {
        await renderRSC(res, component, await getProps(), cssFiles);
      } else {
        serveHTMLFile(res, path.slice(1) + "/index.html");
      }
    });
  }
);

// Static route handlers
pageConfig.static.forEach((path) => {
  app.get(path, async (req, res) => {
    if (
      req.headers["sec-fetch-dest"] === "empty" &&
      req.headers["sec-fetch-mode"] === "cors"
    ) {
      serveRSCFile(res, path.slice(1) + "/index.rsc");
    } else {
      serveHTMLFile(res, path.slice(1) + "/index.html");
    }
  });
});

// 404 route - must be last
app.get(/(.*)/, async (req, res) => {
  if (
    req.headers["sec-fetch-dest"] === "empty" &&
    req.headers["sec-fetch-mode"] === "cors"
  ) {
    serveRSCFile(res, "404/index.rsc");
  } else {
    serveHTMLFile(res, "404/index.html");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Static files served from: ${staticDir}`);
});
