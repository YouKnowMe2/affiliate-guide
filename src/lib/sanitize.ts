/**
 * HTML sanitization helpers for untrusted CMS (WordPress) content.
 *
 * All HTML rendered via `dangerouslySetInnerHTML` MUST pass through one of
 * these helpers. They strip event handlers, javascript: URIs, and other XSS
 * vectors while preserving Gutenberg/WP markup and class names.
 */
import DOMPurify from "dompurify";

const BODY_CONFIG = {
  USE_PROFILES: { html: true },
  ADD_ATTR: [
    "target",
    "rel",
    "loading",
    "decoding",
    "data-shortcode",
    "data-shortcode-mount",
    "data-newsletter-mount",
    "data-variant",
    "data-slug",
    "data-title",
    "data-source",
  ],
  // iframes are common in WP for embedded videos — allow but strip handlers.
  ADD_TAGS: ["iframe"],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus"],
};

const TITLE_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "span", "br", "sup", "sub"],
  ALLOWED_ATTR: ["class"],
};

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), BODY_CONFIG) as unknown as string;
}

export function sanitizeTitle(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), TITLE_CONFIG) as unknown as string;
}
