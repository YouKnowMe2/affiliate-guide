import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { track } from "@/lib/analytics";

/** Shared CTA renderer (handles internal/external/mailto). */
export const SmartCTA = ({
  to,
  children,
  className = "",
  analyticsSource,
  analyticsLabel,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  analyticsSource?: string;
  analyticsLabel?: string;
}) => {
  const onClick = () => {
    if (analyticsSource) {
      track("cta_click", { source: analyticsSource, label: analyticsLabel, target: to });
    }
  };
  if (to.startsWith("http") || to.startsWith("mailto:") || to.startsWith("tel:")) {
    return (
      <a href={to} className={className} onClick={onClick} data-analytics="cta-click">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} onClick={onClick} data-analytics="cta-click">
      {children}
    </Link>
  );
};

/** Glassy eyebrow chip used at the top of every hero. */
export const EyebrowChip = ({
  icon,
  label,
  badge,
}: {
  icon: string;
  label: string;
  badge?: string;
}) => (
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border text-xs font-medium uppercase tracking-wider mb-6">
    <span>{icon}</span>
    <span>{label}</span>
    {badge && <span className="text-muted-foreground">· {badge}</span>}
  </div>
);

/** Strong gradient pill button. */
export const GradientButton = ({
  to,
  gradient,
  children,
}: {
  to: string;
  gradient: string;
  children: React.ReactNode;
}) => (
  <SmartCTA
    to={to}
    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-premium-glow hover:opacity-95 transition`}
  >
    {children} <ArrowRight className="h-4 w-4" />
  </SmartCTA>
);

/** Outline / glass secondary button. */
export const GlassButton = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <SmartCTA
    to={to}
    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-card border border-border font-semibold hover:bg-muted transition"
  >
    {children}
  </SmartCTA>
);

/** Bottom CTA band — reused at the end of every layout. */
export const CTASection = ({ template }: Pick<LayoutProps, "template">) => (
  <section className="container-app pb-20">
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${template.gradient} p-8 md:p-14 text-white shadow-premium-glow`}
    >
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div className="relative max-w-2xl">
        <p className="text-xs uppercase tracking-wider opacity-80 mb-3">
          {template.eyebrow}
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 leading-tight">
          পরবর্তী ধাপে যান
        </h2>
        <p className="opacity-90 mb-7 text-lg">
          আপনার অ্যাফিলিয়েট জার্নিকে দ্রুত গতি দিন — কিউরেটেড টুলস ও গাইড দিয়ে।
        </p>
        <div className="flex flex-wrap gap-3">
          <SmartCTA
            to={template.cta.to}
            analyticsSource="footer-cta-band"
            analyticsLabel={template.cta.label}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-foreground font-semibold hover:bg-white/90 transition"
          >
            {template.cta.label} <ArrowRight className="h-4 w-4" />
          </SmartCTA>
          <Link
            to="/tools"
            onClick={() => track("cta_click", { source: "footer-cta-band", label: "all-tools", target: "/tools" })}
            data-analytics="cta-click"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/15 backdrop-blur border border-white/30 font-semibold hover:bg-white/25 transition"
          >
            সব টুলস দেখুন
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/** Prose wrapper used by content-heavy layouts. Optionally enriches WP HTML
 *  with auto-injected CTA cards and related-page links. */
import { useMemo, useRef } from "react";
import { enrichWPContent, type RelatedLink } from "@/lib/enrichWPContent";
import { usePages } from "@/lib/cms";
import { PAGE_TEMPLATES } from "../pageTemplates";
import { useNewsletterHydration } from "@/components/affiliate/useNewsletterHydration";
import { useShortcodeHydration } from "@/components/affiliate/useShortcodeHydration";
import { sanitizeHtml } from "@/lib/sanitize";

export const ProseContent = ({
  html,
  template,
  currentSlug,
}: {
  html: string;
  template?: LayoutProps["template"];
  currentSlug?: string;
}) => {
  const { data: pages = [] } = usePages();
  const containerRef = useRef<HTMLDivElement>(null);

  const enriched = useMemo(() => {
    if (!template) return html;
    // Build related pages: pull other pages with the same template variant first,
    // then fall back to other mapped pages.
    const related: RelatedLink[] = [];
    const seen = new Set<string>([currentSlug ?? ""]);
    pages.forEach((p) => {
      if (seen.has(p.slug)) return;
      const tpl = PAGE_TEMPLATES.find((t) => t.slug === p.slug);
      if (!tpl) return;
      if (tpl.variant === template.variant) {
        related.push({ title: p.title.replace(/<[^>]+>/g, "").trim(), to: tpl.path });
        seen.add(p.slug);
      }
    });
    if (related.length < 4) {
      pages.forEach((p) => {
        if (related.length >= 6 || seen.has(p.slug)) return;
        const tpl = PAGE_TEMPLATES.find((t) => t.slug === p.slug);
        if (!tpl) return;
        related.push({ title: p.title.replace(/<[^>]+>/g, "").trim(), to: tpl.path });
        seen.add(p.slug);
      });
    }
    const currentPage = pages.find((p) => p.slug === currentSlug);
    return enrichWPContent(html, {
      template,
      related,
      slug: currentSlug,
      title: currentPage?.title?.replace(/<[^>]+>/g, "").trim(),
    });
  }, [html, template, currentSlug, pages]);

  const newsletterPortals = useNewsletterHydration(containerRef, enriched);
  const shortcodePortals = useShortcodeHydration(containerRef, enriched);

  return (
    <article className="wp-prose">
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: sanitizeHtml(enriched) }} />
      {newsletterPortals}
      {shortcodePortals}
    </article>
  );
};
