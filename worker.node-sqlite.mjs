// Stands in for node:sqlite inside the Worker bundle (wrangler.jsonc `alias`).
// The likes store only imports node:sqlite when no D1 binding arrived with the
// request, which never happens on Workers; reaching this means the LIKES
// binding is missing from the environment, so say that instead of failing on
// a module workerd does not have.
export class DatabaseSync {
  constructor() {
    throw new Error(
      "node:sqlite is the Node server's likes store; on Workers the action " +
        "expects the LIKES D1 binding (wrangler.jsonc) on the request's platform.",
    );
  }
}
