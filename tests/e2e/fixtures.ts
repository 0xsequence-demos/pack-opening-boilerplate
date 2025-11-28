import fs from "fs";
import path from "path";
import { test as base } from "@playwright/test";

/**
 * Test fixture that mirrors Playwright's `test/expect` but also captures
 * browser console output into a per-test file for later debugging.
 */
export const test = base.extend({
  context: async (
    { browserName, playwright, contextOptions },
    use,
    testInfo,
  ) => {
    // Persist the browser profile (incl. IndexedDB) per browser to keep
    // wallet/session state across runs.
    const userDataDir = path.resolve(
      process.cwd(),
      "playwright/.user-data",
      browserName,
    );
    fs.mkdirSync(userDataDir, { recursive: true });

    // storageState is ignored for persistent contexts; the on-disk profile is the source of truth.
    const { ...restContextOptions } = contextOptions;

    const browserType = playwright[browserName];
    const context = await browserType.launchPersistentContext(userDataDir, {
      ...restContextOptions,
      recordHar: {
        path: testInfo.outputPath("network.har"),
        content: "embed",
      },
    });

    await use(context);
    await context.close();
  },
  page: async ({ context }, use, testInfo) => {
    const page = await context.newPage();
    const logFile = testInfo.outputPath("console.log");

    page.on("console", (msg) => {
      const line = `[browser:${msg.type()}] ${msg.text()}\n`;
      try {
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
        fs.appendFileSync(logFile, line, "utf-8");
      } catch {
        // best-effort; ignore write errors
      }
    });

    await use(page);
    await page.close();
  },
});

export const expect = test.expect;
