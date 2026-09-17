import { test, expect } from "@playwright/test";

/**
 * Pokédex end-to-end against the production build: the prerendered static
 * pages, the per-request path for a form OUTSIDE the vendored dataset (a
 * regional variant), and the likes server-action round-trip (real `"use server"`
 * action backed by SQLite on Node and D1 under workerd — persistence proven by
 * reloading, so a client-only optimistic update can't pass).
 */

// Wait for hydration: the like button only renders after the client bundle
// attaches AND the first getLikes action round-trip resolves, so its
// presence proves interactivity.
const likeButton = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /^(un)?like$/i });
const hydrated = (page: import("@playwright/test").Page) =>
  expect(likeButton(page)).toBeVisible();

test.describe("static pages (prerendered)", () => {
  test("home links into the pokedex", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Pokédex" })).toBeVisible();
    await page.getByRole("link", { name: "Browse the Pokédex" }).click();
    await expect(page).toHaveURL(/\/pokedex\/$/);
    await expect(page.getByRole("link", { name: /Gen 1/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Gen 9/ })).toBeVisible();
  });

  test("a generation page lists its dex slice and navigates to a detail page", async ({
    page,
  }) => {
    await page.goto("/pokedex/gen/1/");
    await expect(page.locator("li")).toHaveCount(151);
    await page.getByRole("link", { name: /pikachu/ }).click();
    await expect(page).toHaveURL(/\/pokedex\/pikachu\/$/);
    await expect(page.getByRole("heading", { name: /pikachu/ })).toBeVisible();
    await expect(page.getByText("Sp. Atk")).toBeVisible();
  });

  test("generation pages chain prev/next across the dex", async ({ page }) => {
    await page.goto("/pokedex/gen/4/");
    await expect(page.locator("li")).toHaveCount(107);
    await page.getByRole("link", { name: "Gen 5 →" }).click();
    await expect(page).toHaveURL(/\/pokedex\/gen\/5\/$/);
    await expect(page.locator("li")).toHaveCount(156);
  });

  test("a prerendered detail page carries no live badge", async ({ page }) => {
    await page.goto("/pokedex/pikachu/");
    await expect(page.getByRole("heading", { name: /pikachu/ })).toBeVisible();
    await expect(page.getByText("rendered per request")).toHaveCount(0);
  });
});

test.describe("per-request path (not prerendered)", () => {
  // Alternate forms sit outside the vendored species dataset, so this page
  // only exists through the server's live render (loader fetches PokéAPI).
  test("a special form renders per request with the live badge", async ({
    page,
  }) => {
    const response = await page.goto("/pokedex/pikachu-rock-star/");
    test.skip(
      response?.status() === 404,
      "PokéAPI unreachable from this environment",
    );
    await expect(
      page.getByRole("heading", { name: /pikachu-rock-star/ }),
    ).toBeVisible();
    await expect(page.getByText("rendered per request")).toBeVisible();
    // The document is flash-free: the name is IN the server HTML, not
    // client-rendered after the fact.
    const html = await response!.text();
    expect(html).toContain("pikachu-rock-star");
  });

  test("an unknown name answers 404 with the not-found page", async ({
    page,
  }) => {
    const response = await page.goto("/pokedex/definitely-not-a-pokemon/");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/does not exist/)).toBeVisible();
  });
});

test.describe("pokemon search", () => {
  test("typing filters the whole roster into icon cards", async ({ page }) => {
    await page.goto("/pokedex/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const input = page.getByLabel("Search Pokémon by name");
    await input.fill("chu");
    const results = page.getByLabel("search results");
    await expect(results.locator('a[href="/pokedex/pikachu/"]')).toBeVisible();
    await expect(results.locator('a[href="/pokedex/raichu/"]')).toBeVisible();
    // The originals grid steps aside while searching.
    await expect(page.getByRole("link", { name: /bulbasaur/ })).toBeHidden();

    await results.locator('a[href="/pokedex/pikachu/"]').click();
    await expect(page).toHaveURL(/\/pokedex\/pikachu\/$/);
  });

  test("a form match beyond the dataset reaches the per-request route", async ({
    page,
  }) => {
    await page.goto("/pokedex/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await page.getByLabel("Search Pokémon by name").fill("rock-star");
    const result = page
      .getByLabel("search results")
      .locator('a[href="/pokedex/pikachu-rock-star/"]');
    await expect(result).toBeVisible();
    await result.click();
    await expect(
      page.getByRole("heading", { name: /pikachu-rock-star/ }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("rendered per request")).toBeVisible();
  });

  test("enter submits the first match", async ({ page }) => {
    await page.goto("/pokedex/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const input = page.getByLabel("Search Pokémon by name");
    await input.fill("Mr. Mime");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/pokedex\/mr-mime\/$/);
    await expect(page.getByRole("heading", { name: /mr-mime/ })).toBeVisible();
  });

  test("the no-JS form GET redirects ?q= to the route", async ({ request }) => {
    const response = await request.get("/pokedex/?q=Mr.%20Mime", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    expect(response.headers()["location"]).toBe("/pokedex/mr-mime/");
  });
});

test.describe("likes server action (prod build)", () => {
  test("a like counts, persists across reload, and an unlike takes it back", async ({
    page,
  }) => {
    await page.goto("/pokedex/pikachu/");
    await hydrated(page);

    const button = likeButton(page);
    const wasLiked = (await button.getAttribute("aria-pressed")) === "true";
    const before = Number(await button.getAttribute("data-count"));
    const after = before + (wasLiked ? -1 : 1);

    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", String(!wasLiked));
    await expect(button).toHaveAttribute("data-count", String(after));

    // Reload: both the count and THIS visitor's state must come back from
    // the store via getLikes (SQLite on Node, D1 on the Worker) keyed by the
    // visitor id the browser kept, not from component state.
    await page.reload();
    await hydrated(page);
    await expect(likeButton(page)).toHaveAttribute(
      "aria-pressed",
      String(!wasLiked),
    );
    await expect(likeButton(page)).toHaveAttribute("data-count", String(after));

    // Toggle back so the test is idempotent across runs.
    await likeButton(page).click();
    await expect(likeButton(page)).toHaveAttribute(
      "aria-pressed",
      String(wasLiked),
    );
    await expect(likeButton(page)).toHaveAttribute("data-count", String(before));
  });
});

test.describe("navigation transition state", () => {
  test("the clicked link goes busy and the page reads as stale until the swap", async ({
    page,
  }) => {
    // Make the pending window deterministic: hold the target's flight briefly.
    await page.route("**/pokedex/bidoof/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const link = page.locator('a[href="/pokedex/bidoof/"]');
    await link.click();
    // The clicked link itself announces the transition…
    await expect(link).toHaveAttribute("aria-busy", "true");
    // …while the old page stays mounted (dirty, not blank).
    await expect(page.getByRole("heading", { name: "Pokédex" })).toBeVisible();
    // The swap lands: new page, and no busy link left anywhere.
    await expect(
      page.getByRole("heading", { name: /bidoof/ }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator("a[data-pending]")).toHaveCount(0);
  });
});
