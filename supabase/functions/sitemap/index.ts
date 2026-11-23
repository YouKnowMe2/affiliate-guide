// Edge Function: sitemap
// Generates an XML sitemap from the connected WordPress source
// (pages, posts, post categories) plus the static React routes.
//
// Public URL example:
//   https://<project>.functions.supabase.co/sitemap
//   ?base=https://www.affiliateguidance.com
//
// Optional query params:
//   ?base=<canonical site origin>   (otherwise inferred from request)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WP_BASE_URL = Deno.env.get("WP_BASE_URL");
const WP_APP_USER = Deno.env.get("WP_APP_USER");
const WP_APP_PASSWORD = Deno.env.get("WP_APP_PASSWORD");

function authHeader() {
  if (!WP_APP_USER || !WP_APP_PASSWORD) return undefined;
  return `Basic ${btoa(`${WP_APP_USER}:${WP_APP_PASSWORD}`)}`;
}

async function wpFetch(path: string): Promise<any> {
  if (!WP_BASE_URL) throw new Error("WP_BASE_URL not set");
  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = authHeader();
  if (auth) headers.Authorization = auth;
  const res = await fetch(`${WP_BASE_URL.replace(/\/$/, "")}${path}`, { headers });
  if (!res.ok) throw new Error(`WP ${res.status} on ${path}`);
  return res.json();
}

const xmlEscape = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

type UrlEntry = { loc: string; lastmod?: string; changefreq?: string; priority?: string };

const urlTag = (e: UrlEntry) =>
  `  <url>
    <loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}${
      e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : ""
    }${e.priority ? `\n    <priority>${e.priority}</priority>` : ""}
  </url>`;

// Static React routes the SPA serves
const STATIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/categories", priority: "0.8", changefreq: "weekly" },
  { path: "/tools", priority: "0.9", changefreq: "weekly" },
  { path: "/tools/hosting", priority: "0.7", changefreq: "weekly" },
  { path: "/tools/seo", priority: "0.7", changefreq: "weekly" },
  { path: "/tools/keyword", priority: "0.7", changefreq: "weekly" },
  { path: "/tools/email", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/guest-post", priority: "0.5", changefreq: "monthly" },
  { path: "/sponsored", priority: "0.5", changefreq: "monthly" },
  { path: "/sitemap", priority: "0.3", changefreq: "monthly" },
];

// Static tool detail pages (sourced from src/data/tools.ts)
const TOOL_PATHS: string[] = [
  "/tools/hosting/cloudoora",
  "/tools/hosting/hostinger",
  "/tools/hosting/bluehost",
  "/tools/hosting/namecheap",
  "/tools/seo/ranksuite",
  "/tools/seo/ahrefs",
  "/tools/seo/semrush",
  "/tools/seo/ubersuggest-seo",
  "/tools/keyword/ubersuggest",
  "/tools/keyword/keyword-tool-io",
  "/tools/keyword/kwfinder",
  "/tools/email/getresponse",
  "/tools/email/mailchimp",
  "/tools/email/convertkit",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const base = (url.searchParams.get("base") || `${url.protocol}//${url.host}`).replace(/\/$/, "");

  const entries: UrlEntry[] = [
    ...STATIC_PATHS.map((s) => ({
      loc: `${base}${s.path}`,
      changefreq: s.changefreq,
      priority: s.priority,
    })),
    ...TOOL_PATHS.map((p) => ({
      loc: `${base}${p}`,
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];

  try {
    const [pages, posts, categories, tags] = await Promise.all([
      wpFetch(`/wp-json/wp/v2/pages?per_page=100&status=publish`).catch(() => []),
      wpFetch(`/wp-json/wp/v2/posts?per_page=100&status=publish`).catch(() => []),
      wpFetch(`/wp-json/wp/v2/categories?per_page=100&hide_empty=1`).catch(() => []),
      wpFetch(`/wp-json/wp/v2/tags?per_page=100&hide_empty=1`).catch(() => []),
    ]);

    if (Array.isArray(pages)) {
      for (const p of pages) {
        if (!p?.slug) continue;
        const slug = String(p.slug);
        if (["home", "homepage", "front-page"].includes(slug)) continue;
        entries.push({
          loc: `${base}/p/${encodeURIComponent(slug)}`,
          lastmod: p.modified ? new Date(p.modified).toISOString() : undefined,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }

    if (Array.isArray(posts)) {
      for (const p of posts) {
        if (!p?.slug) continue;
        entries.push({
          loc: `${base}/${encodeURIComponent(p.slug)}`,
          lastmod: p.modified ? new Date(p.modified).toISOString() : undefined,
          changefreq: "weekly",
          priority: "0.8",
        });
      }
    }

    if (Array.isArray(categories)) {
      for (const c of categories) {
        if (!c?.slug || c.slug === "uncategorized") continue;
        entries.push({
          loc: `${base}/category/${encodeURIComponent(c.slug)}`,
          changefreq: "weekly",
          priority: "0.7",
        });
      }
    }

    if (Array.isArray(tags)) {
      for (const t of tags) {
        if (!t?.slug) continue;
        entries.push({
          loc: `${base}/tag/${encodeURIComponent(t.slug)}`,
          changefreq: "weekly",
          priority: "0.6",
        });
      }
    }
  } catch (e) {
    console.error("[sitemap] WP fetch error:", e instanceof Error ? e.message : e);
    // Still return static entries
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlTag).join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
});
