/**
 * generate-sitemap.mjs
 * --------------------
 * Fetches the dynamic XML sitemap from the `sitemap` Edge Function
 * (which pulls pages, posts, categories, and tags from WordPress)
 * and writes it to `public/sitemap.xml` so it is served at the site root.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://ehzyqposjunnvrapivfn.supabase.co";

const SITE_BASE =
  process.env.SITE_BASE_URL ||
  process.env.VITE_SITE_BASE_URL ||
  "https://affiliateguidance.com";

const OUT_PATH = path.resolve(process.cwd(), "public/sitemap.xml");

const FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_BASE}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${SITE_BASE}/blog</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${SITE_BASE}/categories</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>${SITE_BASE}/tools</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
  <url><loc>${SITE_BASE}/about</loc><priority>0.5</priority><changefreq>monthly</changefreq></url>
  <url><loc>${SITE_BASE}/contact</loc><priority>0.5</priority><changefreq>monthly</changefreq></url>
</urlset>`;

export async function generateSitemap({ silent = false } = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/sitemap?base=${encodeURIComponent(SITE_BASE)}`;
  let xml = FALLBACK;
  try {
    if (!silent) console.log(`[sitemap] fetching ${url}`);
    const res = await fetch(url, { headers: { Accept: "application/xml" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    if (body.includes("<urlset")) xml = body;
    else throw new Error("response did not contain a urlset");
  } catch (err) {
    if (!silent) {
      console.warn(`[sitemap] using fallback — ${err instanceof Error ? err.message : err}`);
    }
  }
  if (!existsSync(path.dirname(OUT_PATH))) {
    await mkdir(path.dirname(OUT_PATH), { recursive: true });
  }
  await writeFile(OUT_PATH, xml, "utf8");
  if (!silent) console.log(`[sitemap] wrote ${OUT_PATH} (${xml.length} bytes)`);
  return xml;
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
