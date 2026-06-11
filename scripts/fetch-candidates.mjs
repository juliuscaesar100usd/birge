// Dev helper: fetch top-8 Openverse candidates for products whose first-hit
// photo was weak, emit a thumbnail picker page (public/_pick.html) and the
// candidate URL list (scripts/candidates.json) for download-by-index.
//   node scripts/fetch-candidates.mjs

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const QUERIES = {
  prd_13: "hair straightener",
  prd_25: "robot vacuum cleaner floor",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const candidates = {};
let html =
  "<html><body style='margin:8px;font-family:sans-serif'>";

for (const [id, q] of Object.entries(QUERIES)) {
  const url =
    "https://api.openverse.org/v1/images/?page_size=8&q=" + encodeURIComponent(q);
  const res = await fetch(url, { headers: { "User-Agent": "birge-hackathon-demo/1.0" } });
  const json = res.ok ? await res.json() : {};
  const list = (json.results ?? []).filter((r) => (r.width ?? 0) >= 500);
  candidates[id] = list.map((r) => r.url);
  html += `<h4 style='margin:10px 0 4px'>${id} — "${q}"</h4><div style='display:flex;gap:6px;flex-wrap:wrap'>`;
  list.forEach((r, i) => {
    html += `<div style='text-align:center'><img src='${r.thumbnail}' style='width:110px;height:110px;object-fit:cover;border:1px solid #ccc'><br><small>#${i}</small></div>`;
  });
  html += "</div>";
  console.log(`${id} "${q}": ${list.length} candidates`);
  await sleep(600);
}

html += "</body></html>";
writeFileSync(join(ROOT, "public", "_pick.html"), html);
writeFileSync(join(ROOT, "scripts", "candidates.json"), JSON.stringify(candidates, null, 2));
console.log("\nWrote public/_pick.html and scripts/candidates.json");
