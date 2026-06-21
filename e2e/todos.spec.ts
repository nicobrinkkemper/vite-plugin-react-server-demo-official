import { test, expect } from "@playwright/test";

/**
 * Prod server-action round-trip, end to end.
 *
 * Drives the production Express build (real `"use server"` actions backed by
 * SQLite — not the GitHub-Pages stub path). Proves an action's effect actually
 * persists server-side by reloading between steps: a client-only optimistic
 * update would survive the first assert but NOT the post-reload one.
 */
test.describe("todos server actions (prod build)", () => {
  test("add persists across reload, then delete persists", async ({ page }) => {
    const title = `e2e-${Date.now()}`;

    await page.goto("/todos/");
    // The page is prerendered HTML; wait for the client bundle to hydrate before
    // interacting, or the click lands before React attaches the handler.
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Add a uniquely-named todo via the real addTodo server action.
    await page.getByPlaceholder("Add a new todo...").fill(title);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.locator("li", { hasText: title })).toBeVisible();

    // Reload: the todo must still be there — proves addTodo hit the DB, not just
    // local component state.
    await page.reload();
    await expect(page.locator("li", { hasText: title })).toBeVisible();

    // Delete it via the real deleteTodo server action.
    await page
      .locator("li", { hasText: title })
      .getByRole("button", { name: "×" })
      .click();
    await expect(page.locator("li", { hasText: title })).toHaveCount(0);

    // Reload: it must stay gone — proves deleteTodo persisted.
    await page.reload();
    await expect(page.locator("li", { hasText: title })).toHaveCount(0);
  });

  test("a client component that directly imports a server function can call it", async ({
    page,
  }) => {
    // ServerFnProbe is a "use client" component that imports getTodos (a
    // "use server" action) directly and calls it on click. vprs rewrites the
    // import to a createServerReference proxy, so the click round-trips to the
    // server. Proves the client-import half of Server Functions parity in a
    // real browser (server body never shipped; the call hits the server).
    await page.goto("/todos/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const probe = page.getByTestId("server-fn-probe");
    await expect(probe).toHaveText("Probe server fn");
    await probe.click();
    await expect(probe).toHaveText(/server says: \d+ todos/);
  });

  test("flash-free dynamic SSR: live todos in the initial HTML, hydrate with zero refetch", async ({
    page,
  }) => {
    // /todos is a dynamic route: the server renders the CURRENT db todos to HTML
    // per request and inlines the matching flight (createHtmlStreamWithInlineFlight),
    // so the browser hydrates in place — no empty-shell flash, no index.rsc round
    // trip. This guards against regressing to the fetch-on-load path (which the
    // other tests would still pass, since they only check eventual visibility).
    const title = `ssr-${Date.now()}`;

    await page.goto("/todos/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await page.getByPlaceholder("Add a new todo...").fill(title);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.locator("li", { hasText: title })).toBeVisible();

    // Collect console/page errors (a hydration mismatch — React #418 — logs here)
    // and any index.rsc fetches across the reload.
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    const rscRequests: string[] = [];
    page.on("request", (r) => r.url().includes(".rsc") && rscRequests.push(r.url()));

    // The reload's document response must already contain the added todo and the
    // inline flight — proof it was server-rendered from live data, not fetched.
    const response = await page.reload({ waitUntil: "commit" });
    const initialHtml = await response!.text();
    expect(initialHtml, "added todo must be in the initial server HTML").toContain(title);
    expect(initialHtml, "inline flight payload must be present").toContain('id="vprs-flight"');

    await page.waitForLoadState("networkidle");
    await expect(page.locator("li", { hasText: title })).toBeVisible();

    // Hydrate-in-place: no index.rsc fetch on load, no hydration error.
    expect(rscRequests, "no index.rsc refetch on initial load").toEqual([]);
    expect(errors, "no hydration / console errors").toEqual([]);
  });
});
