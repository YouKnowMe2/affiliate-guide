/**
 * Inject contextual CTA cards and related-page links into WordPress
 * Gutenberg HTML — at strategic positions (after the 2nd and 4th H2).
 *
 * We do this client-side using DOMParser so we don't have to round-trip the
 * content through a server.
 */
import type { PageTemplate } from "@/pages/wp/pageTemplates";
import { parseShortcodes } from "@/components/affiliate/shortcodes";

export interface RelatedLink {
  title: string;
  to: string;
}

export interface InjectOptions {
  template: Pick<PageTemplate, "variant" | "gradient" | "cta" | "icon" | "eyebrow">;
  related: RelatedLink[];
  /** Used to seed deterministic newsletter variant + analytics context. */
  slug?: string;
  title?: string;
}

const NEWSLETTER_VARIANTS = ["default", "card", "gradient", "compact"] as const;
function pickNewsletterVariant(seed?: string): string {
  if (!seed) return "default";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return NEWSLETTER_VARIANTS[Math.abs(h) % NEWSLETTER_VARIANTS.length];
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

/** Build a CTA card HTML node. */
function ctaCard(opts: InjectOptions): string {
  const { template } = opts;
  const isExternal = /^https?:|^mailto:/.test(template.cta.to);
  return `
    <aside class="wp-inject-cta my-10 not-prose rounded-2xl p-6 md:p-8 bg-gradient-to-br ${template.gradient} text-white shadow-premium-glow">
      <div class="flex items-start gap-4">
        <div class="text-3xl leading-none">${template.icon}</div>
        <div class="flex-1 min-w-0">
          <p class="text-xs uppercase tracking-wider opacity-80 mb-1">${escapeHtml(template.eyebrow)}</p>
          <p class="font-display text-xl md:text-2xl font-semibold leading-tight mb-3">
            ${escapeHtml(template.cta.label)} — এখনই
          </p>
          <a
            href="${template.cta.to}"
            ${isExternal ? 'target="_blank" rel="noopener"' : ""}
            data-analytics="cta-click"
            data-cta-source="inline-prose"
            data-cta-variant="${escapeHtml(template.variant)}"
            data-cta-label="${escapeHtml(template.cta.label)}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-foreground font-semibold text-sm hover:bg-white/90 transition no-underline"
          >
            ${escapeHtml(template.cta.label)} →
          </a>
        </div>
      </div>
    </aside>
  `;
}

/**
 * Build a newsletter signup placeholder. Rendered as a hydration mount-point
 * — `useNewsletterHydration` will replace it with a working React form
 * (variants: default | card | gradient | compact).
 *
 * The fallback markup inside is shown only briefly before hydration so SSR
 * crawlers and pre-hydration users still see a sensible block.
 */
function newsletterCard(opts: InjectOptions): string {
  const variant = pickNewsletterVariant(opts.slug || opts.title);
  const slugAttr = opts.slug ? ` data-slug="${escapeHtml(opts.slug)}"` : "";
  const titleAttr = opts.title ? ` data-title="${escapeHtml(opts.title)}"` : "";
  return `
    <div
      class="wp-inject-newsletter my-10 not-prose"
      data-newsletter-mount
      data-variant="${variant}"
      data-source="inline-prose"${slugAttr}${titleAttr}
    >
      <aside class="rounded-2xl p-6 md:p-8 bg-card border border-border shadow-premium-sm animate-pulse">
        <div class="h-5 w-40 bg-muted rounded mb-3"></div>
        <div class="h-4 w-64 bg-muted/70 rounded"></div>
      </aside>
    </div>
  `;
}

/** Build a related-pages card. */
function relatedCard(related: RelatedLink[]): string {
  if (!related.length) return "";
  const items = related
    .slice(0, 4)
    .map(
      (r) => `
      <li class="flex items-start gap-2">
        <span class="text-primary mt-0.5">→</span>
        <a href="${r.to}" data-analytics="related-click" data-related-target="${escapeHtml(r.to)}" class="text-foreground hover:text-primary font-medium no-underline font-bangla">${escapeHtml(r.title)}</a>
      </li>`,
    )
    .join("");
  return `
    <aside class="wp-inject-related my-10 not-prose rounded-2xl p-6 bg-card border border-border">
      <p class="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        🔗 আরও পড়ুন
      </p>
      <ul class="space-y-2.5 text-sm">${items}</ul>
    </aside>
  `;
}

/** Convert raw WP URLs to internal app paths where possible. */
function rewriteAnchors(doc: Document) {
  const anchors = doc.querySelectorAll("a[href]");
  anchors.forEach((a) => {
    const href = a.getAttribute("href") || "";
    try {
      const u = new URL(href, "https://placeholder.local");
      // Same-origin (including the WP origin) → strip to pathname so React Router handles it
      if (u.hostname === "placeholder.local" || u.hostname.includes("affiliateguidance")) {
        let p = u.pathname + u.search + u.hash;
        try { p = decodeURI(p); } catch {}
        if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
        a.setAttribute("href", p || "/");
      } else {
        // External: open in a new tab
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    } catch {/* ignore malformed */}
  });
}

/** Add stable ids to H2/H3 headings so a TOC can deep-link. */
function addHeadingIds(doc: Document) {
  const headings = doc.querySelectorAll("h2, h3");
  headings.forEach((h, i) => {
    if (h.id) return;
    const text = (h.textContent || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
    h.id = text || `section-${i + 1}`;
  });
}

/** Wrap raw <table> elements in a horizontal-scroll container. */
function wrapTables(doc: Document) {
  doc.querySelectorAll("table").forEach((t) => {
    if (t.parentElement?.classList.contains("wp-table-wrap")) return;
    const wrap = doc.createElement("div");
    wrap.className = "wp-table-wrap overflow-x-auto -mx-2 px-2 my-6";
    t.parentNode?.insertBefore(wrap, t);
    wrap.appendChild(t);
  });
}

/** Tune Gutenberg blocks for responsive rendering. */
function tuneGutenbergBlocks(doc: Document) {
  // Columns: count direct .wp-block-column children to drive CSS grid var
  doc.querySelectorAll<HTMLElement>(".wp-block-columns").forEach((el) => {
    const n = el.querySelectorAll(":scope > .wp-block-column").length || 2;
    el.style.setProperty("--wp-cols", String(n));
  });
  // Lazy-load all iframes (YouTube embeds, etc.)
  doc.querySelectorAll<HTMLIFrameElement>("iframe").forEach((f) => {
    if (!f.getAttribute("loading")) f.setAttribute("loading", "lazy");
  });
}

/**
 * Main entry point — returns enriched HTML ready to drop into innerHTML.
 *
 * CTA / related-card placement rule (strict):
 *   - NEVER place a card immediately AFTER a heading element.
 *   - Prefer placement AFTER a paragraph (or other "body" block such as
 *     <ul>, <ol>, <blockquote>, <table>, <figure>, etc.).
 *   - Otherwise place BEFORE the next heading.
 *   - This rule is enforced on the FLATTENED block list, so the same logic
 *     works regardless of Gutenberg block wrappers (`<div class="wp-block-*">`).
 */
export function enrichWPContent(html: string, opts: InjectOptions): string {
  if (!html) return html;
  // Convert author-written [shortcode-name] tokens to mount-point divs FIRST,
  // so the auto-injection logic below treats them as block-level siblings.
  const withShortcodes = parseShortcodes(html);
  const doc = new DOMParser().parseFromString(`<div id="root">${withShortcodes}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return html;

  rewriteAnchors(doc);
  addHeadingIds(doc);
  wrapTables(doc);
  tuneGutenbergBlocks(doc);

  const ctaHtml = ctaCard(opts);
  const relHtml = relatedCard(opts.related);

  const HEADING_RE = /^H[1-6]$/;
  const BODY_BLOCKS = new Set(["P", "UL", "OL", "BLOCKQUOTE", "TABLE", "FIGURE", "PRE", "DIV"]);
  const isHeading = (el: Element | null) => !!el && HEADING_RE.test(el.tagName);
  const isBodyBlock = (el: Element | null) =>
    !!el && (BODY_BLOCKS.has(el.tagName) || el.tagName.startsWith("H") === false);

  /**
   * Some Gutenberg headings are wrapped in containers like
   * <div class="wp-block-heading"><h2>...</h2></div>. Treat those as headings.
   */
  const containsHeading = (el: Element) =>
    isHeading(el) || !!el.querySelector(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6");

  const htmlToNode = (html: string): Node | null => {
    const tpl = doc.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstChild;
  };

  /**
   * Find a "safe" insertion point at or after `startIdx` in the given block list.
   *
   * STRICT RULE (user-requested): CTA / related cards must always be placed
   * IMMEDIATELY BEFORE a heading element. Walk forward from `startIdx` until
   * we hit the next heading (or wrapper containing one) and insert before it.
   * If no heading is found ahead, fall back to walking BACKWARD to the nearest
   * heading. Only as a last resort do we anchor after the last body block.
   */
  const findSafeSpot = (
    blocks: Element[],
    startIdx: number,
  ): { ref: Element; position: "after" | "before" } | null => {
    // Forward pass — look for the next heading and insert BEFORE it
    for (let i = Math.max(0, startIdx); i < blocks.length; i++) {
      const el = blocks[i];
      if (containsHeading(el)) {
        return { ref: el, position: "before" };
      }
    }
    // Backward pass — find an earlier heading we haven't crossed yet
    for (let i = Math.min(startIdx, blocks.length - 1); i >= 0; i--) {
      const el = blocks[i];
      if (containsHeading(el)) {
        return { ref: el, position: "before" };
      }
    }
    // Last resort: anchor after the final body block (no headings exist at all)
    for (let i = blocks.length - 1; i >= 0; i--) {
      const el = blocks[i];
      if (isBodyBlock(el)) {
        return { ref: el, position: "after" };
      }
    }
    return null;
  };

  const insertAt = (
    spot: { ref: Element; position: "after" | "before" } | null,
    html: string,
  ): boolean => {
    if (!spot || !html) return false;
    const node = htmlToNode(html);
    if (!node) return false;
    const { ref, position } = spot;
    if (position === "after") {
      ref.parentNode?.insertBefore(node, ref.nextSibling);
    } else {
      ref.parentNode?.insertBefore(node, ref);
    }
    return true;
  };

  // Work on the FLATTENED top-level block list. Gutenberg often wraps things
  // in `<div class="wp-block-*">` so we keep direct children — they're our
  // semantic blocks.
  const blocks = Array.from(root.children);

  // Find heading anchor positions (H2 in flat list OR a wrapper containing an H2)
  const h2Positions: number[] = [];
  blocks.forEach((el, i) => {
    if (el.tagName === "H2" || el.querySelector(":scope > h2")) h2Positions.push(i);
  });

  // CTA: target slot just after the 2nd H2 section (else ~1/3 through)
  const ctaStart = h2Positions[1] != null
    ? h2Positions[1] + 1
    : Math.max(1, Math.floor(blocks.length / 3));
  insertAt(findSafeSpot(blocks, ctaStart), ctaHtml);

  // Related card: after 4th H2 (else ~2/3 through). Re-snapshot since DOM mutated.
  const blocks2 = Array.from(root.children);
  const h2Positions2: number[] = [];
  blocks2.forEach((el, i) => {
    if (el.tagName === "H2" || el.querySelector(":scope > h2")) h2Positions2.push(i);
  });
  const relStart = h2Positions2[3] != null
    ? h2Positions2[3] + 1
    : Math.floor((blocks2.length * 2) / 3);
  insertAt(findSafeSpot(blocks2, relStart), relHtml);

  // Newsletter signup card: after the 5th H2 (else near the end). Re-snapshot.
  const blocks3 = Array.from(root.children);
  const h2Positions3: number[] = [];
  blocks3.forEach((el, i) => {
    if (el.tagName === "H2" || el.querySelector(":scope > h2")) h2Positions3.push(i);
  });
  const newsStart = h2Positions3[4] != null
    ? h2Positions3[4] + 1
    : Math.max(0, blocks3.length - 2);
  insertAt(findSafeSpot(blocks3, newsStart), newsletterCard(opts));

  return root.innerHTML;
}
