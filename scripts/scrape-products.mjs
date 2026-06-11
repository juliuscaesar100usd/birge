// One-time dev script: pull real product photos (+ prices where possible) for
// the mock catalog, save photos to public/products/, and write the overrides
// manifest src/data/scraped.ts (consumed by products.ts).
//
// Sources, in order:
//   1. Wildberries public search JSON (photo + RUB price) — often bot-walled
//      (429) outside RU; probed once at startup and skipped if blocked.
//   2. Openverse (api.openverse.org, keyless, CC-licensed) — photos only.
//
// The app itself stays fully offline (NFR-1): this runs at dev time only.
//   node scripts/scrape-products.mjs
//
// Etiquette: sequential requests, ~700 ms delay, 2 retries, then the product
// keeps its emoji+gradient fallback. No auth, no anti-bot evasion.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS_TS = join(ROOT, "src", "data", "products.ts");
const OUT_DIR = join(ROOT, "public", "products");
const MANIFEST = join(ROOT, "src", "data", "scraped.ts");

const RUB_KZT = 5.6; // fixed dev-time rate — no live FX
const HERO_ID = "prd_01"; // hand-tuned demo ladder: photo OK, price NEVER
const DELAY_MS = 700;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Generic English queries beat the seed's very specific titles on stock-photo
// sources like Openverse.
const OPENVERSE_QUERY = {
  prd_01: "wireless earbuds",
  prd_02: "smartwatch fitness",
  prd_03: "power bank charger",
  prd_04: "portable bluetooth speaker",
  prd_05: "smartphone tempered glass",
  prd_06: "running sneakers",
  prd_07: "hoodie sweatshirt",
  prd_08: "winter puffer jacket",
  prd_09: "polarized sunglasses",
  prd_10: "cookware pots pans set",
  prd_11: "bedding sheets set",
  prd_12: "air humidifier",
  prd_13: "hair dryer",
  prd_14: "makeup brushes",
  prd_15: "perfume bottle",
  prd_16: "plastic building blocks toy",
  prd_17: "kids kick scooter",
  prd_18: "toy robot",
  prd_19: "dumbbells weights",
  prd_20: "yoga mat",
  prd_21: "city bicycle",
  prd_22: "kitchen blender",
  prd_23: "glass electric kettle",
  prd_24: "air fryer",
  prd_25: "robot vacuum cleaner",
  prd_26: "laptop backpack",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round100 = (x) => Math.round(x / 100) * 100;

// ── 1. Pull (id, titleRu, soloPriceKzt) out of the seed file ────────────────
function parseSeed() {
  const src = readFileSync(PRODUCTS_TS, "utf8");
  const items = [];
  const re =
    /id:\s*"(prd_\d+)"[\s\S]*?titleRu:\s*"([^"]+)"[\s\S]*?soloPriceKzt:\s*([\d_]+)/g;
  for (const m of src.matchAll(re)) {
    items.push({ id: m[1], titleRu: m[2], soloPriceKzt: Number(m[3].replace(/_/g, "")) });
  }
  return items;
}

async function fetchJson(url, tries = 2) {
  for (let i = 0; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
      if (res.status === 429) return { blocked: true };
      if (res.ok) return await res.json();
    } catch {
      /* retry */
    }
    await sleep(DELAY_MS);
  }
  return null;
}

async function downloadTo(url, outPath) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) return false;
    writeFileSync(outPath, buf);
    return true;
  } catch {
    return false;
  }
}

// ── 2a. Wildberries public search ───────────────────────────────────────────
async function searchWb(query) {
  const url =
    "https://search.wb.ru/exactmatch/ru/common/v5/search?appType=1&curr=rub" +
    "&dest=-1257786&resultset=catalog&sort=popular&page=1&query=" +
    encodeURIComponent(query);
  const json = await fetchJson(url);
  if (json?.blocked) return { blocked: true };
  const p = json?.data?.products?.[0];
  if (!p) return null;
  const kopecks = p.sizes?.[0]?.price?.product ?? p.salePriceU ?? p.priceU ?? null;
  return { nmId: p.id, name: p.name, priceRub: kopecks ? kopecks / 100 : null };
}

// WB image CDN: basket host is sharded by vol — probe until 200
async function downloadWbPhoto(nmId, outPath) {
  const vol = Math.floor(nmId / 1e5);
  const part = Math.floor(nmId / 1e3);
  for (let n = 1; n <= 30; n++) {
    const host = `basket-${String(n).padStart(2, "0")}.wbbasket.ru`;
    for (const file of ["1.webp", "1.jpg"]) {
      const url = `https://${host}/vol${vol}/part${part}/${nmId}/images/big/${file}`;
      if (await downloadTo(url, outPath)) return true;
    }
  }
  return false;
}

// ── 2b. Openverse (CC-licensed photos, keyless) ─────────────────────────────
async function openversePhoto(query, outPath) {
  const url =
    "https://api.openverse.org/v1/images/?page_size=8&q=" + encodeURIComponent(query);
  const json = await fetchJson(url);
  const results = json?.results ?? [];
  for (const r of results) {
    if ((r.width ?? 0) < 500) continue;
    if (await downloadTo(r.url, outPath)) return true;
  }
  return false;
}

// ── main ────────────────────────────────────────────────────────────────────
const seed = parseSeed();
if (seed.length === 0) {
  console.error("Could not parse any products from products.ts — aborting.");
  process.exit(1);
}
console.log(`Parsed ${seed.length} products from seed.`);
mkdirSync(OUT_DIR, { recursive: true });

const probe = await searchWb("наушники");
const wbAvailable = probe && !probe.blocked;
console.log(
  wbAvailable
    ? "Wildberries reachable — using WB for photos + prices.\n"
    : "Wildberries blocked/unreachable — Openverse photos only, mock prices kept.\n"
);

const manifest = {};
for (const item of seed) {
  const entry = {};
  let note = [];

  if (wbAvailable) {
    const hit = await searchWb(item.titleRu);
    if (hit && !hit.blocked) {
      const out = join(OUT_DIR, `${item.id}.webp`);
      if (await downloadWbPhoto(hit.nmId, out)) {
        entry.image = `/products/${item.id}.webp`;
        note.push(`WB photo (nm ${hit.nmId})`);
      }
      if (item.id !== HERO_ID && hit.priceRub) {
        const kzt = round100(hit.priceRub * RUB_KZT);
        // a bad search match must not produce an absurd price
        if (kzt >= item.soloPriceKzt * 0.5 && kzt <= item.soloPriceKzt * 1.5) {
          entry.soloPriceKzt = kzt;
          note.push(`price ${item.soloPriceKzt} → ${kzt} ₸`);
        } else {
          note.push(`WB price ${kzt} ₸ outside ±50% clamp, kept`);
        }
      }
    }
  }

  if (!entry.image) {
    const out = join(OUT_DIR, `${item.id}.jpg`);
    const q = OPENVERSE_QUERY[item.id] ?? item.titleRu;
    if (await openversePhoto(q, out)) {
      entry.image = `/products/${item.id}.jpg`;
      note.push(`Openverse photo ("${q}")`);
    }
  }

  console.log(
    `${entry.image ? "✓" : "✗"} ${item.id} "${item.titleRu}" — ${
      note.length ? note.join(", ") : "no photo, emoji fallback"
    }`
  );
  if (entry.image || entry.soloPriceKzt) manifest[item.id] = entry;
  await sleep(DELAY_MS);
}

// ── 3. Write the overrides manifest ─────────────────────────────────────────
const body =
  "// GENERATED by scripts/scrape-products.mjs — do not edit by hand.\n" +
  "// Photo/price overrides scraped once at dev time; app stays offline (NFR-1).\n" +
  "export const scraped: Record<string, { image?: string; soloPriceKzt?: number }> = " +
  JSON.stringify(manifest, null, 2) +
  ";\n";
writeFileSync(MANIFEST, body);
console.log(`\nWrote ${Object.keys(manifest).length} overrides to src/data/scraped.ts`);
