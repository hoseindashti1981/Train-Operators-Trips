import { copyFileSync, cpSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const result = spawnSync(
  "node",
  ["scripts/with-app-env.mjs", "vite", "build", "--config", "vite.pages.config.ts"],
  { stdio: "inherit" },
);
if (result.status !== 0) process.exit(result.status ?? 1);

const dist = join(process.cwd(), "dist-pages");
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
writeFileSync(join(dist, ".nojekyll"), "");

const docs = join(process.cwd(), "docs");
rmSync(docs, { recursive: true, force: true });
cpSync(dist, docs, { recursive: true });
console.log("[pages] built dist-pages and synced docs/ for GitHub Pages (main /docs path)");
