import { test, expect } from "./fixtures";

/**
 * Connected-flow coverage using real network calls.
 * Requires a wallet session already active in the UI.
 * Set E2E_WALLET_ADDRESS (and ensure the browser storage state is logged in)
 * to avoid skipping these tests.
 */
// Wallet-backed flows must be single-browser to avoid nonce collisions.
test.describe.configure({ mode: "serial" });
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "Runs only in Chromium to avoid parallel wallet transactions.",
);

test.describe("Connected experience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("packs grid renders and pack detail opens", async ({ page }) => {
    const grid = page.getByTestId("pack-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    const firstPack = grid.locator('[data-testid^="pack-card-"]').first();
    await expect(firstPack).toBeVisible({ timeout: 15000 });
    await firstPack.click();

    await expect(page.getByTestId("pack-header")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("pack-name")).toBeVisible();

    await page.getByTestId("back-to-packs").click();
    await expect(grid).toBeVisible();
  });

  test("debug tools and controls are present", async ({ page }) => {
    await expect(page.getByTestId("debug-utils")).toBeVisible();
    await expect(page.getByTestId("headless-pack-opening")).toBeVisible();
    const autoOpenToggle = page.getByTestId("auto-open-toggle");
    await autoOpenToggle
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(async () => {
        // Card may be collapsed; expand and retry.
        await page.getByTestId("headless-pack-opening").click();
        await autoOpenToggle.waitFor({ state: "visible", timeout: 5000 });
      });
    await expect(page.getByTestId("animation-state")).toBeVisible();

    // Toggle auto-open to ensure the control is interactive.
    const initial = await autoOpenToggle.getAttribute("aria-checked");
    await autoOpenToggle.click();
    const toggled = await autoOpenToggle.getAttribute("aria-checked");
    expect(toggled).not.toEqual(initial);
  });

  test("extra info and item utils render", async ({ page }) => {
    await expect(page.getByTestId("extra-info")).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByTestId("item-utils")).toBeVisible();
    const burnButton = page.getByTestId("burn-items");
    await burnButton
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(async () => {
        // Card may be collapsed; expand and retry.
        await page.getByTestId("item-utils").click();
        await burnButton.waitFor({ state: "visible", timeout: 5000 });
      });
  });

  test("can open a pack or mint if none", async ({ page }) => {
    test.setTimeout(120_000);

    const grid = page.getByTestId("pack-grid");
    await expect(grid).toBeVisible({ timeout: 30000 });

    const firstPack = grid.locator('[data-testid^="pack-card-"]').first();
    await expect(firstPack).toBeVisible({ timeout: 15000 });
    await firstPack.click();
    await expect(page.getByTestId("pack-header")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("pack-name")).toBeVisible();

    let openButton = page.getByTestId("open-pack-3d");
    const mintButton = page.getByTestId("mint-packs");

    const waitForOpen = () =>
      openButton.waitFor({ state: "visible", timeout: 20000 }).then(
        () => true,
        () => false,
      );
    const waitForMint = () =>
      mintButton.waitFor({ state: "visible", timeout: 20000 }).then(
        () => true,
        () => false,
      );

    const canOpen = await waitForOpen();
    const canMint = !canOpen && (await waitForMint());

    const openPackFlow = async () => {
      await openButton.waitFor({ state: "visible", timeout: 30000 });
      await expect(openButton).toBeEnabled({ timeout: 30000 });
      await openButton.scrollIntoViewIfNeeded();
      await openButton.click({ force: true });

      const items = page.getByTestId("pack-opened-items");
      await items.waitFor({ state: "attached", timeout: 120000 });

      const firstItem = items.getByTestId("pack-opened-item").first();
      await firstItem.waitFor({ state: "attached", timeout: 20000 });
    };

    if (canOpen) {
      await openPackFlow();
      return;
    }

    if (canMint) {
      await mintButton.click();
      await expect(mintButton).toBeDisabled({ timeout: 2000 });

      // Wait for the newly minted pack to show up; reload if necessary.
      await expect(openButton)
        .toBeVisible({ timeout: 60000 })
        .catch(async () => {
          await page.reload();
          const gridAfter = page.getByTestId("pack-grid");
          await expect(gridAfter).toBeVisible({ timeout: 30000 });
          const firstPackAfter = gridAfter
            .locator('[data-testid^="pack-card-"]')
            .first();
          await expect(firstPackAfter).toBeVisible({ timeout: 15000 });
          await firstPackAfter.click();
          await expect(page.getByTestId("pack-header")).toBeVisible({
            timeout: 15000,
          });
          await expect(page.getByTestId("pack-name")).toBeVisible();
          openButton = page.getByTestId("open-pack-3d");
          await expect(openButton).toBeVisible({ timeout: 60000 });
        });
      await openPackFlow();
      return;
    }

    test.skip(
      true,
      "No packs to open and no mint option available for this wallet.",
    );
  });
});
