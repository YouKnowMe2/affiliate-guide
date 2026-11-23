import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string | null;
  type?: "website" | "article";
  /** Robots directives, e.g. "index,follow" or "noindex,nofollow,noarchive" */
  robots?: string;
  /** Optional structured-data (JSON-LD) — array or single object */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Raw HTML containing one or more <script type="application/ld+json">…</script>
   *  blocks (e.g. RankSuite's `_ranksuite_schema_head` meta). When provided,
   *  this overrides `jsonLd` so the WP-authored schema wins. */
  schemaHead?: string;
};

const SITE_NAME = "Affiliate Guidance";
const DEFAULT_DESCRIPTION =
  "বাংলায় Affiliate Marketing শেখার সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম — guides, reviews, tools ও step-by-step tutorials।";

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

const absoluteUrl = (value?: string) => {
  if (!value) return window.location.origin + window.location.pathname;
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return window.location.origin + window.location.pathname;
  }
};

const setMeta = (
  selector: string,
  attrs: Record<string, string>,
  content?: string,
) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => el!.setAttribute(key, value));
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const JSONLD_ID = "seo-jsonld";
const SCHEMA_HEAD_ATTR = "data-seo-schema-head";

const setJsonLd = (data?: SEOProps["jsonLd"]) => {
  const existing = document.head.querySelector(`script#${JSONLD_ID}`);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSONLD_ID;
  script.text = JSON.stringify(Array.isArray(data) ? data : [data]);
  document.head.appendChild(script);
};

/** Extract JSON bodies from a raw HTML blob like RankSuite's `schema_head`.
 *  Falls back to treating the whole blob as a single JSON-LD payload when
 *  no <script> wrapper is present. */
const extractJsonLdBlocks = (raw: string): string[] => {
  const blocks: string[] = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const body = m[1].trim();
    if (body) blocks.push(body);
  }
  if (blocks.length === 0) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) blocks.push(trimmed);
  }
  return blocks;
};

const setSchemaHead = (raw?: string) => {
  // Always clear any previously-injected blocks (per-route reset).
  document.head
    .querySelectorAll(`script[${SCHEMA_HEAD_ATTR}]`)
    .forEach((n) => n.remove());
  if (!raw) return;
  const blocks = extractJsonLdBlocks(raw);
  blocks.forEach((body) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(SCHEMA_HEAD_ATTR, "1");
    script.text = body;
    document.head.appendChild(script);
  });
};

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = "website",
  robots,
  jsonLd,
  schemaHead,
}: SEOProps) => {
  useEffect(() => {
    const cleanTitle = stripHtml(title) || SITE_NAME;
    const cleanDescription = stripHtml(description) || DEFAULT_DESCRIPTION;
    const cleanKeywords = stripHtml(keywords);
    const canonicalUrl = absoluteUrl(canonical);
    const imageUrl = image ? absoluteUrl(image) : undefined;
    const robotsContent = (robots && robots.trim()) || "index,follow,max-image-preview:large";

    document.title = cleanTitle;
    setMeta('meta[name="description"]', { name: "description" }, cleanDescription);
    setMeta('meta[name="keywords"]', { name: "keywords" }, cleanKeywords);
    setMeta('meta[name="robots"]', { name: "robots" }, robotsContent);
    setMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    setMeta('meta[property="og:title"]', { property: "og:title" }, cleanTitle);
    setMeta('meta[property="og:description"]', { property: "og:description" }, cleanDescription);
    setMeta('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    setMeta('meta[property="og:type"]', { property: "og:type" }, type);
    setMeta('meta[property="og:image"]', { property: "og:image" }, imageUrl);
    setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, imageUrl ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, cleanTitle);
    setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, cleanDescription);
    setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);
    setCanonical(canonicalUrl);
    // WP-authored RankSuite schema_head wins; component-level jsonLd is only
    // used as a fallback when no WP schema is present.
    if (schemaHead && schemaHead.trim()) {
      setJsonLd(undefined);
      setSchemaHead(schemaHead);
    } else {
      setSchemaHead(undefined);
      setJsonLd(jsonLd);
    }
  }, [title, description, keywords, canonical, image, type, robots, jsonLd, schemaHead]);

  return null;
};

export default SEO;
