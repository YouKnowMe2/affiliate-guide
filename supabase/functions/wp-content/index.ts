// Edge Function: wp-content
// Proxies a self-hosted WordPress REST API (with ACF fields) and normalizes
// the responses to match the shapes used by the React app
// (Post, Tool, ToolCategoryMeta in src/data/*).
//
// Query params:
//   ?resource=posts
//   ?resource=post&slug=<slug>
//   ?resource=tools
//   ?resource=tool&category=<cat>&slug=<slug>
//   ?resource=tool-categories
//   ?resource=tool-category&slug=<cat>
//
// Auth to WordPress: HTTP Basic with Application Password.
// Required project secrets: WP_BASE_URL, WP_APP_USER, WP_APP_PASSWORD.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WP_BASE_URL = Deno.env.get("WP_BASE_URL");
const WP_APP_USER = Deno.env.get("WP_APP_USER");
const WP_APP_PASSWORD = Deno.env.get("WP_APP_PASSWORD");

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const err = (message: string, status = 500, details?: unknown) =>
  json({ error: message, details: details ?? null }, status);

function authHeader() {
  if (!WP_APP_USER || !WP_APP_PASSWORD) return undefined;
  const token = btoa(`${WP_APP_USER}:${WP_APP_PASSWORD}`);
  return `Basic ${token}`;
}

// Per-request flag set from the top-level handler so deeper helpers can
// honour the ?noCache=1 / ?nocache=1 query parameter.
let __bypassCache = false;

async function wpFetch(path: string): Promise<any> {
  if (!WP_BASE_URL) throw new Error("WP_BASE_URL is not configured");
  const base = `${WP_BASE_URL.replace(/\/$/, "")}${path}`;
  const auth = authHeader();
  const isWpV2 = /\/wp-json\/wp\/v2\//.test(base);

  const buildUrl = (withEdit: boolean) => {
    let url = base;
    if (withEdit && !/[?&]context=/.test(url)) {
      url += (url.includes("?") ? "&" : "?") + "context=edit";
    }
    if (__bypassCache) {
      url += (url.includes("?") ? "&" : "?") + `_cb=${Date.now()}`;
    }
    return url;
  };

  const headers: Record<string, string> = { Accept: "application/json" };
  if (__bypassCache) {
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
  }
  if (auth) headers.Authorization = auth;

  // Try context=edit first when authenticated; fall back to default `view`
  // context if the WP user lacks edit permission (401/403).
  const tryEdit = !!auth && isWpV2;
  let res = await fetch(buildUrl(tryEdit), { headers, cache: "no-store" });
  if (!res.ok && tryEdit && (res.status === 401 || res.status === 403)) {
    await res.text().catch(() => "");
    res = await fetch(buildUrl(false), { headers, cache: "no-store" });
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WP ${res.status} ${res.statusText} on ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// Fetch RankSuite SEO data for a post/page by ID. Returns title/description/keywords
// (and optional canonical/robots/schemaHead if present). Authenticated — requires admin WP user.
async function fetchRanksuiteSeo(id: number | string | undefined): Promise<Record<string, string> | null> {
  if (!id) return null;
  try {
    const data = await wpFetch(`/wp-json/ranksuite/v1/get-seo-data/${id}`);
    if (!data || typeof data !== "object") return null;
    const out: Record<string, string> = {};
    const t = cleanText(data.title); if (t) out.title = t;
    const d = cleanText(data.description); if (d) out.description = d;
    const k = cleanText(data.focus_keywords ?? data.keywords); if (k) out.keywords = k;
    const c = cleanText(data.canonical ?? data.canonical_url); if (c) out.canonical = c;
    const r = cleanText(data.robots); if (r) out.robots = r;
    // Raw JSON-LD schema HTML (preserved verbatim — never stripped)
    const sh = pickRawString(
      data.schema_head,
      data.schemaHead,
      data._ranksuite_schema_head,
      data.ranksuite_schema_head,
    );
    if (sh) out.schemaHead = sh;
    return out;
  } catch (e) {
    console.warn("[wp-content] ranksuite SEO fetch failed for id", id, (e as Error)?.message);
    return null;
  }
}

// Merge RankSuite data into a normalized item's seo object (RankSuite wins).
async function enrichSeo<T extends { seo?: any }>(item: T, id: number | string | undefined): Promise<T> {
  const rs = await fetchRanksuiteSeo(id);
  if (rs) item.seo = { ...(item.seo ?? {}), ...rs };
  return item;
}

// Returns the first non-empty raw string from the given candidates, preserving HTML.
function pickRawString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (v == null || v === false) continue;
    if (typeof v === "object" && !Array.isArray(v)) continue;
    const s = Array.isArray(v) ? v.filter((x) => typeof x === "string").join("\n") : String(v);
    const trimmed = s.trim();
    if (trimmed && trimmed !== "[object Object]") return trimmed;
  }
  return undefined;
}

function schemaHeadFromCandidate(value: unknown): string | undefined {
  const raw = pickRawString(value);
  if (raw) return raw;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidate = obj.schema_data ?? obj["@graph"] ?? value;
    if (candidate && typeof candidate === "object" && Object.keys(candidate as Record<string, unknown>).length) {
      try {
        return `<script type="application/ld+json">${JSON.stringify(candidate)}</script>`;
      } catch { /* ignore */ }
    }
  }
  return undefined;
}

// ─────────── normalizers ───────────

function pickImage(wp: any): string | null {
  const fm = wp?._embedded?.["wp:featuredmedia"]?.[0];
  return fm?.source_url ?? wp?.acf?.image ?? null;
}

function cleanText(value: unknown): string | undefined {
  if (value == null || value === false) return undefined;
  const raw = Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value);
  const text = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text || undefined;
}

function collectCustomFields(wp: any): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const add = (key: unknown, value: unknown) => {
    if (!key || value == null || value === false) return;
    fields[String(key).toLowerCase()] = value;
  };
  const scan = (container: any) => {
    if (!container) return;
    if (Array.isArray(container)) {
      container.forEach((entry) => add(entry?.key ?? entry?.name, entry?.value));
      return;
    }
    if (typeof container === "object") {
      Object.entries(container).forEach(([key, value]) => add(key, value));
    }
  };
  scan(wp?.acf);
  scan(wp?.meta);
  scan(wp?.custom_fields);
  scan(wp?.fields);
  Object.entries(wp ?? {}).forEach(([key, value]) => {
    if (/^(ranksuite|rank_math|_yoast_wpseo|yoast|seo_|meta_|canonical|keywords?)/i.test(key)) {
      add(key, value);
    }
  });
  return fields;
}

function firstField(fields: Record<string, unknown>, names: string[]): string | undefined {
  for (const name of names) {
    const value = cleanText(fields[name.toLowerCase()]);
    if (value) return value;
  }
  return undefined;
}

function normalizeSeo(wp: any) {
  const fields = collectCustomFields(wp);
  const yoast = wp?.yoast_head_json ?? {};
  const title = firstField(fields, [
    "ranksuite_seo_title",
    "ranksuite_title",
    "ranksuite_meta_title",
    "rank_suite_title",
    "rank_math_title",
    "_yoast_wpseo_title",
    "yoast_title",
    "seo_title",
    "meta_title",
  ]) ?? cleanText(yoast?.title);
  const description = firstField(fields, [
    "ranksuite_seo_description",
    "ranksuite_description",
    "ranksuite_meta_description",
    "rank_suite_description",
    "rank_math_description",
    "_yoast_wpseo_metadesc",
    "yoast_description",
    "seo_description",
    "meta_description",
  ]) ?? cleanText(yoast?.description);
  const keywords = firstField(fields, [
    "ranksuite_focus_keyword",
    "ranksuite_focus_keywords",
    "ranksuite_keywords",
    "rank_suite_keywords",
    "rank_math_focus_keyword",
    "_yoast_wpseo_focuskw",
    "seo_keywords",
    "meta_keywords",
    "keywords",
  ]);
  const canonical = firstField(fields, [
    "ranksuite_canonical",
    "ranksuite_canonical_url",
    "rank_suite_canonical",
    "rank_math_canonical_url",
    "_yoast_wpseo_canonical",
    "canonical",
    "canonical_url",
  ]) ?? cleanText(yoast?.canonical);

  // Robots — combine boolean toggles (noindex/nofollow/noarchive) into a CSV
  const directives: string[] = [];
  const truthy = (v: unknown) =>
    v === true || v === 1 || v === "1" || v === "true" || v === "on" || v === "yes";
  const noindex = truthy(fields["ranksuite_noindex"] ?? fields["rank_math_robots_noindex"] ?? fields["_yoast_wpseo_meta-robots-noindex"]);
  const nofollow = truthy(fields["ranksuite_nofollow"] ?? fields["rank_math_robots_nofollow"] ?? fields["_yoast_wpseo_meta-robots-nofollow"]);
  const noarchive = truthy(fields["ranksuite_noarchive"] ?? fields["rank_math_robots_noarchive"]);
  const noimageindex = truthy(fields["ranksuite_noimageindex"] ?? fields["rank_math_robots_noimageindex"]);
  const nosnippet = truthy(fields["ranksuite_nosnippet"] ?? fields["rank_math_robots_nosnippet"]);
  directives.push(noindex ? "noindex" : "index");
  directives.push(nofollow ? "nofollow" : "follow");
  if (noarchive) directives.push("noarchive");
  if (noimageindex) directives.push("noimageindex");
  if (nosnippet) directives.push("nosnippet");
  // Allow explicit override via ranksuite_robots
  const robotsOverride = firstField(fields, ["ranksuite_robots", "rank_math_robots", "robots", "meta_robots"]);
  const robots = robotsOverride ?? directives.join(",");

  // Raw JSON-LD schema HTML (kept verbatim — never sanitized)
  let schemaHead = schemaHeadFromCandidate(fields["_ranksuite_schema_head"])
    ?? schemaHeadFromCandidate(fields["ranksuite_schema_head"])
    ?? schemaHeadFromCandidate(fields["schema_head"]);
  // RankSuite also exposes `ranksuite_schema_head` as a top-level object
  // shaped { schema_data: <JSON-LD object> }. Convert to a script tag so the
  // client extractor (which expects raw HTML) picks it up.
  if (!schemaHead) {
    const rsh = wp?.ranksuite_schema_head;
    schemaHead = schemaHeadFromCandidate(rsh);
  }

  return { title, description, keywords, canonical, robots, schemaHead };
}

function normalizePost(wp: any) {
  const acf = wp?.acf ?? {};
  return {
    slug: wp.slug,
    title: wp.title?.rendered ?? "",
    excerpt: (acf.bangla_excerpt || wp.excerpt?.rendered || "").replace(/<[^>]+>/g, "").trim(),
    content: wp.content?.rendered ?? "",
    contentType: acf.content_type ?? "Informational",
    category: acf.blog_category ?? "Beginner",
    readTime: acf.read_time ?? "৫ মিনিট",
    date: wp.date ? new Date(wp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
    image: pickImage(wp) ?? "",
    author: wp?._embedded?.author?.[0]?.name ?? acf.author ?? "Shawon",
    monetization: acf.monetization || undefined,
    seo: normalizeSeo(wp),
    // WP taxonomy categories (numeric IDs) — used for /category/:slug pages
    categoryIds: Array.isArray(wp.categories) ? wp.categories : [],
    // WP tags (numeric IDs) — used for related-post tag matching
    tagIds: Array.isArray(wp.tags) ? wp.tags : [],
  };
}

function normalizeTestimonial(wp: any) {
  const acf = wp?.acf ?? {};
  const title = (wp.title?.rendered ?? "").replace(/<[^>]+>/g, "").trim();
  const quoteRaw =
    acf.quote ?? acf.testimonial ?? wp.content?.rendered ?? wp.excerpt?.rendered ?? "";
  const quote = String(quoteRaw).replace(/<[^>]+>/g, "").trim();
  const name = (acf.name ?? acf.author_name ?? title ?? "").toString();
  const initials = (acf.initials ??
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p[0])
      .join("")
      .toUpperCase()) as string;
  return {
    id: wp.id,
    name,
    role: (acf.role ?? acf.title ?? "").toString(),
    quote,
    rating: Number(acf.rating ?? 5),
    initials,
    color: acf.color_gradient ?? "from-violet-500 to-fuchsia-500",
    avatar: acf.avatar ?? pickImage(wp) ?? null,
    verified: acf.verified !== false,
    order: Number(wp.menu_order ?? acf.order ?? 0),
  };
}

function normalizePage(wp: any) {
  return {
    slug: wp.slug,
    title: wp.title?.rendered ?? "",
    content: wp.content?.rendered ?? "",
    excerpt: (wp.excerpt?.rendered ?? "").replace(/<[^>]+>/g, "").trim(),
    image: wp?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    date: wp.date ?? null,
    modified: wp.modified ?? null,
    seo: normalizeSeo(wp),
  };
}

function decodeWpSlug(s: string): string {
  try { return decodeURIComponent(s); } catch { return s; }
}

function normalizePostCategory(wp: any) {
  return {
    id: wp.id,
    slug: decodeWpSlug(wp.slug ?? ""),
    rawSlug: wp.slug ?? "",
    name: (wp.name ?? "").toString(),
    description: (wp.description ?? "").toString(),
    count: Number(wp.count ?? 0),
    parent: Number(wp.parent ?? 0),
    seo: normalizeSeo(wp),
  };
}

function normalizeTool(wp: any) {
  const acf = wp?.acf ?? {};

  // Resolve category from (in order):
  //  1) the `tool_category` taxonomy term embedded via `_embed`
  //  2) ACF `category` select field
  //  3) sensible fallback
  let category = "";
  const embeddedTerms: any[] = wp?._embedded?.["wp:term"] ?? [];
  for (const group of embeddedTerms) {
    if (!Array.isArray(group)) continue;
    const term = group.find(
      (t: any) => t?.taxonomy === "tool_category" || t?.taxonomy === "tool-category",
    );
    if (term?.slug) {
      category = String(term.slug);
      break;
    }
  }
  if (!category && typeof acf.category === "string" && acf.category.length > 0) {
    category = acf.category;
  }
  if (!category) category = "hosting";

  return {
    slug: wp.slug,
    name: wp.title?.rendered ?? acf.name ?? wp.slug ?? "",
    category,
    tagline: acf.tagline ?? "",
    benefit: acf.benefit ?? "",
    whyRecommend: acf.why_recommend ?? "",
    beginnerNote: acf.beginner_note ?? "",
    rating: Number(acf.rating ?? 4.5),
    price: acf.price ?? "",
    speed: acf.speed ?? undefined,
    freeTrial: Boolean(acf.free_trial),
    beginnerFriendly: Boolean(acf.beginner_friendly),
    topPick: Boolean(acf.is_top_pick),
    badge: acf.badge ?? undefined,
    url: acf.affiliate_url ?? "#",
    initials: acf.initials ?? (wp.title?.rendered?.slice(0, 2) ?? "??"),
    color: acf.color_gradient ?? "from-violet-500 to-fuchsia-500",
    commission: acf.commission ?? "",
    image: pickImage(wp),
    content: wp.content?.rendered ?? "",
    excerpt: wp.excerpt?.rendered ?? "",
    seo: normalizeSeo(wp),
  };
}

function normalizeCategory(wp: any) {
  const acf = wp?.acf ?? {};
  const wpTitle = (wp.title?.rendered ?? "").trim();
  const banglaTitle = (acf.bangla_title ?? "").trim();
  // Use whichever is set; if both empty, fall back to a humanized slug
  const slugTitle = (wp.slug ?? "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
  const title = wpTitle || banglaTitle || slugTitle;
  return {
    slug: wp.slug,
    title,
    banglaTitle: banglaTitle || title,
    shortDesc: acf.short_desc ?? "",
    hook: acf.hero_headline_bn ?? acf.hook ?? "",
    cta: acf.cta_text ?? "👉 এখনই দেখুন",
    icon: acf.icon ?? "🔥",
    color: acf.color_gradient ?? "from-violet-500 to-fuchsia-500",
    faqs: Array.isArray(acf.faqs) ? acf.faqs : [],
    comparisonRows: Array.isArray(acf.comparison_rows) ? acf.comparison_rows : [],
    seo: normalizeSeo(wp),
  };
}

function normalizeMenuItem(wp: any) {
  // Supports both WP core /menu-items endpoint and WP-API-Menus plugin shape
  const objectSlug = wp.slug ?? wp.object_slug ?? wp.post_name ?? wp.object?.slug;
  const url: string = wp.url ?? wp.link ?? wp.guid?.rendered ?? (objectSlug ? `/${objectSlug}` : "#");
  let to = url;
  try {
    const u = new URL(url);
    to = u.pathname + u.search + u.hash;
  } catch {/* already a path */}
  // Decode percent-encoded slugs (Bangla URLs) and strip trailing slash (except root)
  try { to = decodeURI(to); } catch {/* keep as is */}
  if (to === "#" && objectSlug) to = `/${objectSlug}`;
  if (to.length > 1 && to.endsWith("/")) to = to.slice(0, -1);
  if (!to) to = "/";
  const parentRaw = wp.menu_item_parent ?? wp.parent ?? 0;
  const parent = parentRaw === "0" || parentRaw === 0 ? 0 : parentRaw;
  const label = cleanText(wp.title?.rendered ?? wp.title ?? wp.name ?? wp.label ?? objectSlug) ?? "";
  return {
    id: wp.ID ?? wp.id,
    label,
    to,
    en: wp?.meta?.en_label ?? wp?.acf?.en_label ?? "",
    target: wp.target || "_self",
    parent,
    order: wp.menu_order ?? wp.order ?? 0,
  };
}

async function findPageByPath(pathname: string) {
  const slug = pathname.replace(/^\/+|\/+$/g, "").split("/").pop();
  if (!slug) return null;
  const data = await wpFetch(`/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&per_page=1`).catch(() => null);
  const item = Array.isArray(data) ? data[0] : null;
  return item ? { slug: item.slug, link: item.link ?? `/${item.slug}` } : null;
}

// ─────────── handler ───────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!WP_BASE_URL) {
    return err("WordPress is not configured. Set WP_BASE_URL secret.", 503);
  }

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const slug = url.searchParams.get("slug");
  const category = url.searchParams.get("category");

  // Cache bypass: ?noCache=1 forces a fresh fetch from WordPress and skips
  // any intermediary caching. Per-request scoped via the wpFetch helper.
  __bypassCache = ["1", "true", "yes"].includes(
    (url.searchParams.get("noCache") ?? url.searchParams.get("nocache") ?? "").toLowerCase(),
  );

  try {
    if (resource === "debug-seo") {
      const id = url.searchParams.get("id");
      if (!id) return err("id required", 400);
      const post = await wpFetch(`/wp-json/wp/v2/posts/${id}`).catch(() => null);
      return json({ seo: post ? normalizeSeo(post) : null });
    }
    switch (resource) {
      case "posts": {
        const data = await wpFetch(`/wp-json/wp/v2/posts?per_page=50&_embed=1&status=publish`);
        return json({ items: (Array.isArray(data) ? data : []).map(normalizePost) });
      }
      case "post-categories": {
        const data = await wpFetch(`/wp-json/wp/v2/categories?per_page=100&hide_empty=1`);
        const items = (Array.isArray(data) ? data : [])
          .map(normalizePostCategory)
          .filter((c: any) => c.slug && c.slug !== "uncategorized");
        return json({ items });
      }
      case "post-tags": {
        const data = await wpFetch(`/wp-json/wp/v2/tags?per_page=100&hide_empty=1`).catch(() => []);
        const items = (Array.isArray(data) ? data : []).map((t: any) => ({
          id: t.id,
          slug: decodeWpSlug(t.slug ?? ""),
          rawSlug: t.slug ?? "",
          name: t.name ?? "",
          count: t.count ?? 0,
          seo: normalizeSeo(t),
        }));
        return json({ items });
      }
      case "post-tag": {
        if (!slug) return err("slug is required", 400);
        const all = await wpFetch(`/wp-json/wp/v2/tags?per_page=100`).catch(() => []);
        const list = (Array.isArray(all) ? all : []).map((t: any) => ({
          id: t.id,
          slug: decodeWpSlug(t.slug ?? ""),
          rawSlug: t.slug ?? "",
          name: t.name ?? "",
          count: t.count ?? 0,
          seo: normalizeSeo(t),
        }));
        const decoded = decodeWpSlug(slug);
        const match = list.find(
          (t: any) => t.slug === decoded || t.rawSlug === slug || t.rawSlug === encodeURIComponent(decoded),
        );
        if (!match) return err("Tag not found", 404);
        const posts = await wpFetch(
          `/wp-json/wp/v2/posts?tags=${match.id}&per_page=50&_embed=1&status=publish`,
        ).catch(() => []);
        return json({
          item: match,
          posts: (Array.isArray(posts) ? posts : []).map(normalizePost),
        });
      }
      case "post-category": {
        if (!slug) return err("slug is required", 400);
        // Match by decoded slug OR raw slug (Bangla slugs are percent-encoded in WP)
        const all = await wpFetch(`/wp-json/wp/v2/categories?per_page=100`);
        const list = Array.isArray(all) ? all.map(normalizePostCategory) : [];
        const decoded = decodeWpSlug(slug);
        const match = list.find(
          (c: any) => c.slug === decoded || c.rawSlug === slug || c.rawSlug === encodeURIComponent(decoded),
        );
        if (!match) return err("Category not found", 404);
        const posts = await wpFetch(
          `/wp-json/wp/v2/posts?categories=${match.id}&per_page=50&_embed=1&status=publish`,
        ).catch(() => []);
        return json({
          item: match,
          posts: (Array.isArray(posts) ? posts : []).map(normalizePost),
        });
      }
      case "post": {
        if (!slug) return err("slug is required", 400);
        const data = await wpFetch(`/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&status=publish`);
        const item = Array.isArray(data) ? data[0] : null;
        if (!item) return json({ item: null });
        return json({ item: await enrichSeo(normalizePost(item), item.id) });
      }
      case "tools": {
        const q = category ? `&filter[meta_key]=category&filter[meta_value]=${encodeURIComponent(category)}` : "";
        // Custom post type "tool"
        const data = await wpFetch(`/wp-json/wp/v2/tool?per_page=100&_embed=1&status=publish${q}`);
        return json({ items: (Array.isArray(data) ? data : []).map(normalizeTool) });
      }
      case "tool": {
        if (!slug) return err("slug is required", 400);
        const data = await wpFetch(`/wp-json/wp/v2/tool?slug=${encodeURIComponent(slug)}&_embed=1&status=publish`);
        const item = Array.isArray(data) ? data[0] : null;
        if (!item) return err("Tool not found", 404);
        return json({ item: await enrichSeo(normalizeTool(item), item.id) });
      }
      case "tool-categories": {
        const data = await wpFetch(`/wp-json/wp/v2/tool_category?per_page=50&_embed=1`);
        return json({ items: (Array.isArray(data) ? data : []).map(normalizeCategory) });
      }
      case "tool-category": {
        if (!slug) return err("slug is required", 400);
        const data = await wpFetch(`/wp-json/wp/v2/tool_category?slug=${encodeURIComponent(slug)}&_embed=1`);
        const item = Array.isArray(data) ? data[0] : null;
        if (!item) return err("Category not found", 404);
        return json({ item: normalizeCategory(item) });
      }
      case "pages": {
        // Only published pages are exposed publicly.
        const path = `/wp-json/wp/v2/pages?per_page=100&status=publish`;
        const data = await wpFetch(path).catch((e) => {
          console.error("[wp-content] pages fetch error:", e?.message ?? e);
          return [];
        });
        console.log("[wp-content] pages count:", Array.isArray(data) ? data.length : "not-array");
        return json({
          items: (Array.isArray(data) ? data : []).map((item: any) => ({
            ...normalizePage(item),
            content: undefined,
            status: item.status ?? null,
          })),
        });
      }
      case "page": {
        if (!slug) return err("slug is required", 400);
        // Special: "home" / "front-page" → resolve via WP reading settings (page_on_front)
        if (slug === "home" || slug === "front-page" || slug === "frontpage") {
          const settings = await wpFetch(`/wp-json/wp/v2/settings`).catch((e) => {
            console.warn("[wp-content] settings fetch failed:", e?.message ?? e);
            return null;
          });
          console.log("[wp-content] front-page settings:", JSON.stringify({
            show_on_front: settings?.show_on_front,
            page_on_front: settings?.page_on_front,
          }));
          const frontId = settings?.page_on_front;
          if (frontId) {
            const pageData = await wpFetch(`/wp-json/wp/v2/pages/${frontId}?_embed=1`).catch((e) => {
              console.warn("[wp-content] front page fetch failed:", e?.message ?? e);
              return null;
            });
            if (pageData) return json({ item: await enrichSeo(normalizePage(pageData), pageData.id) });
          }
          // Fallback 1: try common slugs
          for (const candidate of ["home", "homepage", "front-page", "frontpage"]) {
            const fb = await wpFetch(
              `/wp-json/wp/v2/pages?slug=${encodeURIComponent(candidate)}&_embed=1&status=publish`,
            ).catch(() => []);
            const it = Array.isArray(fb) ? fb[0] : null;
            if (it) return json({ item: await enrichSeo(normalizePage(it), it.id) });
          }
          // Fallback 2: match by site home URL from /wp-json root index
          const root = await wpFetch(`/wp-json/`).catch(() => null);
          const homeUrl: string | undefined = root?.home || root?.url;
          if (homeUrl) {
            const norm = (u: string) => u.replace(/\/+$/, "").toLowerCase();
            const target = norm(homeUrl);
            const pages = await wpFetch(`/wp-json/wp/v2/pages?per_page=100&_embed=1&status=publish`).catch(() => []);
            const match = Array.isArray(pages)
              ? pages.find((p: any) => p?.link && norm(p.link) === target)
              : null;
            if (match) return json({ item: await enrichSeo(normalizePage(match), match.id) });
          }
          return err("Page not found", 404);
        }
        const data = await wpFetch(`/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_embed=1&status=publish`);
        const item = Array.isArray(data) ? data[0] : null;
        if (!item) return err("Page not found", 404);
        return json({ item: await enrichSeo(normalizePage(item), item.id) });
      }
      case "testimonials": {
        // Try a custom post type "testimonial" first; fall back to ACF options page if absent.
        const data = await wpFetch(
          `/wp-json/wp/v2/testimonial?per_page=50&_embed=1&orderby=menu_order&order=asc&status=publish`,
        ).catch(() => []);
        const list = Array.isArray(data) ? data : [];
        return json({
          items: list.map(normalizeTestimonial).sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
          ),
        });
      }
      case "menu": {
        // Resolves a WP menu by (in order): location slug, menu slug, or menu name.
        // Usage: ?resource=menu&slug=main-menu  OR  ?resource=menu&location=primary
        const location = url.searchParams.get("location");
        const candidates = Array.from(
          new Set(
            [slug, location, "primary", "main-menu", "main", "header"]
              .filter(Boolean) as string[],
          ),
        );
        let items: any[] = [];

        // 1) WP-API-Menus / "WP REST API Menus" plugin — by location
        for (const c of candidates) {
          if (items.length) break;
          const data = await wpFetch(
            `/wp-json/menus/v1/locations/${encodeURIComponent(c)}`,
          ).catch(() => null);
          if (data?.items?.length) items = data.items;
          else if (Array.isArray(data?.menu_items)) items = data.menu_items;
        }

        // 2) Same plugin — by menu slug
        for (const c of candidates) {
          if (items.length) break;
          const data = await wpFetch(
            `/wp-json/menus/v1/menus/${encodeURIComponent(c)}`,
          ).catch(() => null);
          if (data?.items?.length) items = data.items;
          else if (Array.isArray(data)) items = data;
        }

        // 3) WP core /wp/v2/menus (requires menus marked show_in_rest)
        if (!items.length) {
          const allMenus = await wpFetch(`/wp-json/wp/v2/menus?per_page=100`).catch(() => null);
          if (Array.isArray(allMenus) && allMenus.length) {
            const wanted = candidates.map((c) => c.toLowerCase());
            const match =
              allMenus.find((m: any) =>
                wanted.includes((m.slug ?? "").toLowerCase()) ||
                wanted.includes((m.name ?? "").toLowerCase()) ||
                wanted.includes((m.name ?? "").toLowerCase().replace(/\s+/g, "-"))
              ) ?? allMenus[0];
            if (match?.id) {
              const data = await wpFetch(
                `/wp-json/wp/v2/menu-items?menus=${match.id}&per_page=100&orderby=menu_order&order=asc`,
              ).catch(() => null);
              if (Array.isArray(data)) items = data;
            }
          }
        }

        // Some menu endpoints (WP-API-Menus) return a NESTED tree where each
        // item has `children` / `child_items`. Flatten it so the client gets
        // a flat list with proper `parent` IDs for tree-building.
        const flat: any[] = [];
        const walk = (nodes: any[], parentId: any = 0) => {
          for (const n of nodes) {
            const id = n.ID ?? n.id;
            const rawParent = n.menu_item_parent ?? n.parent;
            const shouldUseNestedParent = parentId && (!rawParent || rawParent === "0" || rawParent === 0);
            const childrenKey =
              (Array.isArray(n.children) && n.children) ||
              (Array.isArray(n.child_items) && n.child_items) ||
              (Array.isArray(n.submenu) && n.submenu) ||
              null;
            // Inject parent if WP didn't provide one
            const withParent = {
              ...n,
              menu_item_parent: shouldUseNestedParent ? parentId : (rawParent ?? 0),
            };
            flat.push(withParent);
            if (childrenKey && childrenKey.length) walk(childrenKey, id);
          }
        };
        walk(items);

        return json({
          items: flat.map(normalizeMenuItem).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        });
      }
      case "search": {
        const q = (url.searchParams.get("q") ?? "").trim();
        if (!q) return json({ items: [] });
        const per = Math.min(Number(url.searchParams.get("per_page") ?? 10), 20);
        const subtypes = url.searchParams.get("subtypes") ?? "post,page";
        const data = await wpFetch(
          `/wp-json/wp/v2/search?search=${encodeURIComponent(q)}&per_page=${per}&subtypes=${encodeURIComponent(subtypes)}`,
        ).catch(() => []);
        const items = (Array.isArray(data) ? data : []).map((r: any) => {
          let path = "/";
          let slug = "";
          try {
            const u = new URL(r.url);
            const clean = u.pathname.replace(/\/$/, "");
            path = decodeURI(clean) || "/";
            slug = decodeURIComponent(clean.split("/").filter(Boolean).pop() ?? "");
          } catch {/* keep */}
          return {
            id: r.id,
            title: cleanText(r.title) ?? "",
            url: r.url,
            path,
            slug,
            type: r.type,         // "post" | "page" etc.
            subtype: r.subtype,   // "post" | "page" | ...
          };
        });
        return json({ items });
      }
      default:
        return err(
          "Unknown resource. Use one of: posts, post, tools, tool, tool-categories, tool-category, post-categories, post-category, testimonials, menu, page, pages, search",
          400,
        );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Log full details server-side only — never echo internal WP errors to clients.
    console.error("[wp-content] error", msg);
    return err("Content unavailable", 502);
  }
});
