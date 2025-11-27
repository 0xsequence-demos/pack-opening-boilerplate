import { spawnSync } from "child_process";

const args = process.argv.slice(2);

const result = spawnSync("playwright", ["test", ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
