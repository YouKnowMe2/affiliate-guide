import { ArrowRight, Check, Server, Sparkles, Zap, Shield, Rocket, PenTool, Search, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A library of small, varied in-content affiliate widgets for Cloudoora & RankSuite.
 * Each widget is intentionally compact so it can be inserted between content
 * blocks without dominating the page. `pickInlineWidget` selects one
 * deterministically based on the post slug + tag/category hints so the same
 * post always shows the same widget (no layout shift on reload), but different
 * posts surface different widgets.
 */

type WidgetCtx = {
  slug?: string;
  tags?: string[];
  category?: string;
  monetization?: string | null;
};

// ---- Cloudoora widgets ----
const CloudooraDealStrip = () => (
  <aside className="not-prose my-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 flex flex-wrap items-center gap-4">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <Zap className="h-5 w-5 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wider uppercase text-primary">Cloudoora deal</p>
        <p className="font-display text-base md:text-lg font-bold leading-tight">
          €1.79/mo থেকে WordPress hosting — ফ্রি SSL + cPanel
        </p>
      </div>
    </div>
    <Button asChild variant="cta" size="sm" className="shrink-0">
      <a
        href="https://cloudoora.com/wordpress-hosting/"
        target="_blank"
        rel="sponsored noopener"
        data-analytics="cta-click"
        data-cta-source="inline-cloudoora-strip"
      >
        Claim deal <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

const CloudooraSpotlight = () => (
  <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5 md:p-6">
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
        <Rocket className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Recommended · Cloudoora</span>
        <h4 className="font-display text-lg font-bold leading-tight mt-0.5">
          Turbo Boosted hosting — LiteSpeed + Redis cache
        </h4>
        <p className="text-sm text-muted-foreground mt-1.5 font-bangla">
          50 GB NVMe, unlimited sites, CloudLinux isolation — মাত্র €2.60/mo থেকে।
        </p>
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <Button asChild variant="cta" size="sm">
            <a
              href="https://cloudoora.com/turbo-boosted-hosting/"
              target="_blank"
              rel="sponsored noopener"
              data-analytics="cta-click"
              data-cta-source="inline-cloudoora-spotlight"
            >
              Try Turbo <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <span className="text-[11px] text-muted-foreground">30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  </aside>
);

const CloudooraComparePicks = () => (
  <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center gap-2 mb-3">
      <Server className="h-4 w-4 text-primary" />
      <span className="text-[10px] font-bold tracking-wider uppercase text-primary">Cloudoora picks</span>
      <span className="font-display text-sm font-bold">কোন প্ল্যানটি আপনার জন্য?</span>
    </div>
    <div className="grid sm:grid-cols-3 gap-3">
      {[
        { name: "Starter", price: "€1.79", note: "নতুন ব্লগ", href: "https://cloudoora.com/wordpress-hosting/" },
        { name: "Pro", price: "€2.60", note: "Traffic বাড়ছে", href: "https://cloudoora.com/turbo-boosted-hosting/", highlight: true },
        { name: "Agency", price: "€4.99", note: "Reseller / multi-client", href: "https://cloudoora.com/starter-reseller-hosting/" },
      ].map((p) => (
        <a
          key={p.name}
          href={p.href}
          target="_blank"
          rel="sponsored noopener"
          data-analytics="cta-click"
          data-cta-source="inline-cloudoora-compare"
          data-cta-label={p.name}
          className={`group rounded-xl border p-4 hover:border-primary transition ${
            p.highlight ? "border-primary/40 bg-primary/5" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">{p.name}</span>
            {p.highlight && (
              <span className="text-[9px] font-bold tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                BEST
              </span>
            )}
          </div>
          <div className="font-display text-lg font-black text-primary mt-1">
            {p.price}
            <span className="text-[10px] text-muted-foreground font-medium">/mo</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 font-bangla">{p.note}</p>
        </a>
      ))}
    </div>
  </aside>
);

const CloudooraSecurityCallout = () => (
  <aside className="not-prose my-8 rounded-2xl border border-success/20 bg-success/5 p-5 flex items-start gap-4">
    <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="font-display font-bold text-sm">
        🔒 আপনার সাইট কি সিকিউর hosting-এ আছে?
      </p>
      <p className="text-sm text-muted-foreground mt-1 font-bangla">
        Cloudoora দিচ্ছে free SSL, daily backup, ও CloudLinux isolation — সবই €2/mo এর নিচে।
      </p>
      <a
        href="https://cloudoora.com/pricing"
        target="_blank"
        rel="sponsored noopener"
        data-analytics="cta-click"
        data-cta-source="inline-cloudoora-security"
        className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-2"
      >
        Cloudoora plans দেখুন <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  </aside>
);

// ---- RankSuite widgets ----
const RankSuiteAutopilot = () => (
  <aside className="not-prose my-8 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-5 md:p-6">
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-accent/15 text-accent grid place-items-center shrink-0">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-accent">RankSuite Pro · Content Autopilot</span>
        <h4 className="font-display text-lg font-bold leading-tight mt-0.5">
          পুরো content strategy plan + execute — একটাই AI টুলে
        </h4>
        <p className="text-sm text-muted-foreground mt-1.5 font-bangla">
          Topic cluster discovery → AI writing → scheduling → SEO audit।
        </p>
        <Button asChild variant="cta" size="sm" className="mt-3">
          <a
            href="https://ranksuitepro.com/user/registration"
            target="_blank"
            rel="sponsored noopener"
            data-analytics="cta-click"
            data-cta-source="inline-ranksuite-autopilot"
          >
            Plan & Execute Free <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  </aside>
);

const RankSuiteKeywordTip = () => (
  <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-4">
    <Search className="h-5 w-5 text-primary shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold tracking-wider uppercase text-primary">Quick win · RankSuite</p>
      <p className="font-display text-base font-bold leading-tight font-bangla">
        AI দিয়ে ৫ মিনিটে keyword cluster তৈরি করুন
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 font-bangla">
        Ideas, search volume, intent — এক ক্লিকে।
      </p>
    </div>
    <Button asChild variant="cta" size="sm" className="shrink-0">
      <a
        href="https://ranksuitepro.com/user/registration"
        target="_blank"
        rel="sponsored noopener"
        data-analytics="cta-click"
        data-cta-source="inline-ranksuite-keyword"
      >
        Try free <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

const RankSuiteWriterCard = () => (
  <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center gap-2 mb-2">
      <PenTool className="h-4 w-4 text-accent" />
      <span className="text-[10px] font-bold tracking-wider uppercase text-accent">RankSuite AI Writer</span>
    </div>
    <h4 className="font-display text-base md:text-lg font-bold leading-tight">
      Quick / Expert / Bulk — প্রতিটি পোস্ট SEO-optimized
    </h4>
    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
      {[
        { i: BarChart3, l: "SEO score live দেখুন" },
        { i: Globe, l: "Multi-language support" },
        { i: Sparkles, l: "Tone & intent control" },
        { i: Check, l: "Plagiarism-free output" },
      ].map((f, idx) => (
        <li key={idx} className="flex items-center gap-2 text-xs">
          <f.i className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-foreground/80">{f.l}</span>
        </li>
      ))}
    </ul>
    <Button asChild variant="cta" size="sm" className="mt-4">
      <a
        href="https://ranksuitepro.com/user/registration"
        target="_blank"
        rel="sponsored noopener"
        data-analytics="cta-click"
        data-cta-source="inline-ranksuite-writer"
      >
        Generate first article <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

// ---- Registry + picker ----
type WidgetEntry = {
  key: string;
  family: "cloudoora" | "ranksuite";
  Component: React.FC;
};

const WIDGETS: WidgetEntry[] = [
  { key: "cl-strip",     family: "cloudoora", Component: CloudooraDealStrip },
  { key: "cl-spotlight", family: "cloudoora", Component: CloudooraSpotlight },
  { key: "cl-compare",   family: "cloudoora", Component: CloudooraComparePicks },
  { key: "cl-security",  family: "cloudoora", Component: CloudooraSecurityCallout },
  { key: "rs-autopilot", family: "ranksuite", Component: RankSuiteAutopilot },
  { key: "rs-keyword",   family: "ranksuite", Component: RankSuiteKeywordTip },
  { key: "rs-writer",    family: "ranksuite", Component: RankSuiteWriterCard },
];

const HOSTING_HINTS = ["host", "wordpress", "domain", "server", "cpanel", "ssl", "vps", "cloud", "speed", "site", "হোস্টিং", "সাইট"];
const SEO_HINTS     = ["seo", "keyword", "rank", "content", "search", "traffic", "blog", "writing", "ai", "audit", "কনটেন্ট", "কীওয়ার্ড"];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Pick a single inline widget for a given post context. Deterministic per
 * `slug` so the choice is stable across reloads, but biased toward the
 * relevant family (hosting vs SEO) by tag / category / monetization signals.
 *
 * `exclude` prevents picking from a family already shown elsewhere on the
 * page (e.g., the primary Hosting/SEO CTA above), so we never render two
 * CTAs from the same partner site/category back-to-back.
 */
export function pickInlineWidget(
  ctx: WidgetCtx,
  exclude?: WidgetEntry["family"] | null,
): WidgetEntry {
  const haystack = [
    ctx.slug ?? "",
    ctx.category ?? "",
    ...(ctx.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let preferred: WidgetEntry["family"] | null = null;
  if (ctx.monetization === "hosting") preferred = "cloudoora";
  else if (ctx.monetization === "seo" || ctx.monetization === "keyword") preferred = "ranksuite";
  else {
    const hostScore = HOSTING_HINTS.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0);
    const seoScore  = SEO_HINTS.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0);
    if (hostScore > seoScore) preferred = "cloudoora";
    else if (seoScore > hostScore) preferred = "ranksuite";
  }

  // If the preferred family is excluded (already shown above), flip to the other.
  if (exclude && preferred === exclude) {
    preferred = exclude === "cloudoora" ? "ranksuite" : "cloudoora";
  }

  let pool = preferred ? WIDGETS.filter((w) => w.family === preferred) : WIDGETS;
  // Hard-exclude the family already on screen
  if (exclude) pool = pool.filter((w) => w.family !== exclude);
  if (pool.length === 0) pool = WIDGETS;

  const idx = hashStr(ctx.slug ?? "ag") % pool.length;
  return pool[idx];
}

type Props = WidgetCtx & { className?: string; excludeFamily?: WidgetEntry["family"] | null };

const InlineAffiliateWidget = ({ className, excludeFamily, ...ctx }: Props) => {
  const { Component, key, family } = pickInlineWidget(ctx, excludeFamily ?? null);
  return (
    <div className={className} data-widget-key={key} data-widget-family={family}>
      <Component />
    </div>
  );
};

export default InlineAffiliateWidget;
