import { expect, test } from "./fixtures";

test.describe("Home page", () => {
  test("shows boilerplate landing", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Pack Opening Boilerplate")).toBeVisible();
    await expect(
      page.getByText("Example of how to open packs using Sequence."),
    ).toBeVisible();
  });
});
