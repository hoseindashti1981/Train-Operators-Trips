import { spawnSync } from "node:child_process";

const r = spawnSync(
  process.execPath,
  ["--import", "jiti/register", "--test", "src/lib/lohe/engine.node-test.ts"],
  { stdio: "inherit" },
);
process.exit(r.status ?? 1);
