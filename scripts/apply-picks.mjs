// Dev helper: download manually curated candidate picks (by index into
// scripts/candidates.json) over the weak first-hit photos.
//   node scripts/apply-picks.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = JSON.parse(readFileSync(join(ROOT, "scripts", "candidates.json"), "utf8"));

// Human-reviewed on the _pick.html contact sheet
const PICKS = {
  prd_13: 5,
  prd_25: 3,
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

for (const [id, idx] of Object.entries(PICKS)) {
  const url = candidates[id]?.[idx];
  if (!url) {
    console.log(`✗ ${id} — no candidate #${idx}`);
    continue;
  }
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await res.arrayBuffer());
    if (!res.ok || buf.length < 5000) throw new Error(`status ${res.status}, ${buf.length} B`);
    writeFileSync(join(ROOT, "public", "products", `${id}.jpg`), buf);
    console.log(`✓ ${id} ← #${idx} (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    console.log(`✗ ${id} — ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 500));
}
