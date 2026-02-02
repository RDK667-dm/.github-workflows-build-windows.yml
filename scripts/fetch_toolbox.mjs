import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO = "https://github.com/M-ybeme/Initiative-Tracker.git";
const DEST = path.join(process.cwd(), "app", "web");
const TMP = path.join(process.cwd(), ".cache", "toolbox-src");

function rm(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

console.log("Fetching upstream toolbox source:", REPO);
ensureDir(path.dirname(TMP));
rm(TMP);

execSync(`git clone --depth 1 --filter=blob:none ${REPO} "${TMP}"`, { stdio: "inherit" });

rm(DEST);
ensureDir(DEST);

const allowlist = [
  "css", "js", "data", "images", "schemas", "docs",
  "index.html", "initiative.html", "battlemap.html", "encounterbuilder.html",
  "characters.html", "journal.html", "loot.html", "name.html", "npc.html", "shop.html", "tav.html", "new.html",
  "CHANGELOG.md", "LICENSE.md", "README.md"
];

for (const item of allowlist) {
  const src = path.join(TMP, item);
  if (!fs.existsSync(src)) continue;
  const dst = path.join(DEST, item);
  const stat = fs.statSync(src);
  if (stat.isDirectory()) copyDir(src, dst);
  else fs.copyFileSync(src, dst);
}

if (!fs.existsSync(path.join(DEST, "index.html"))) {
  console.error("ERROR: index.html not found after fetch. Upstream structure may have changed.");
  process.exit(1);
}

console.log("Toolbox files copied into:", DEST);
