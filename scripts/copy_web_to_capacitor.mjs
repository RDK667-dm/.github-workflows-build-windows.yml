import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "app", "web");
const DEST = path.join(process.cwd(), "mobile-capacitor", "www");

function rm(p) { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(SRC)) {
  console.error("ERROR: app/web does not exist. Run the fetch step first.");
  process.exit(1);
}

rm(DEST);
copyDir(SRC, DEST);

if (!fs.existsSync(path.join(DEST, "index.html"))) {
  console.error("ERROR: www/index.html missing after copy.");
  process.exit(1);
}

console.log("Copied web assets to Capacitor webDir:", DEST);
