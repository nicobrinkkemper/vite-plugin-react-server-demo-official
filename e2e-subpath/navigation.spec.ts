import { test, expect, type Page } from "@playwright/test";
import { BASE } from "../playwright.subpath.config.js";

// Every GET the page makes must stay inside the deploy and succeed: a doubled
// or missing base shows up as a 404 long before anything looks broken.
const failedGets = (page: Page) => {
  const failed: string[] = [];
  page.on("response", (r) => {
    if (r.request().method() === "GET" && r.status() >= 400) failed.push(r.url());
  });
  return failed;
};

test("a link navigates under the base and the back button returns", async ({ page }) => {
  const failed = failedGets(page);
  await page.goto(`${BASE}pokedex/gen/1/`, { waitUntil: "networkidle" });

  const pikachu = page.getByRole("link", { name: /pikachu/ });
  await expect(pikachu).toHaveAttribute("href", `${BASE}pokedex/pikachu/`);
  await pikachu.click();
  await expect(page).toHaveURL(new RegExp(`${BASE}pokedex/pikachu/$`));
  await expect(page.getByRole("heading", { name: /pikachu/ })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${BASE}pokedex/gen/1/$`));
  await expect(page.getByRole("heading", { name: "Gen 1" })).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`${BASE}pokedex/pikachu/$`));
  await expect(page.getByRole("heading", { name: /pikachu/ })).toBeVisible();

  expect(failed).toEqual([]);
});

test("a search result navigates under the base and the back button returns", async ({ page }) => {
  const failed = failedGets(page);
  await page.goto(`${BASE}pokedex/`, { waitUntil: "networkidle" });

  await page.getByLabel("Search Pokémon by name").fill("charmander");
  const result = page.getByRole("link", { name: /charmander/ });
  await expect(result).toHaveAttribute("href", `${BASE}pokedex/charmander/`);
  await result.click();
  await expect(page).toHaveURL(new RegExp(`${BASE}pokedex/charmander/$`));
  await expect(page.getByRole("heading", { name: /charmander/ })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${BASE}pokedex/$`));
  await expect(page.getByRole("heading", { name: "Pokédex" })).toBeVisible();

  expect(failed).toEqual([]);
});

test("prerendered links carry the base before any script runs", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${BASE}pokedex/pikachu/`);
  await expect(page.getByRole("link", { name: /Pokédex/ })).toHaveAttribute(
    "href",
    `${BASE}pokedex/`,
  );
  await context.close();
});
