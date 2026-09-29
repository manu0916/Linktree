import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";

const isWindows = process.platform === "win32";
const command = isWindows
  ? process.execPath
  : "npx";
const commandArgs = isWindows
  ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js"), "wrangler@latest", ...process.argv.slice(2)]
  : ["wrangler@latest", ...process.argv.slice(2)];

const result = spawnSync(command, commandArgs, {
  stdio: "inherit",
  env: {
    ...process.env,
    CLOUDFLARE_ACCOUNT_ID: "a802d8fa0e93d6c11433c74a89545d7e",
  },
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
