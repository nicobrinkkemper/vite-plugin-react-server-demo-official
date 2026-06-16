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
});
