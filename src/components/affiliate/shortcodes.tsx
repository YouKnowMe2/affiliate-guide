/**
 * Shortcode registry for in-content affiliate CTAs.
 *
 * Authors can write `[shortcode-name]` anywhere inside WordPress / blog
 * content and it will be replaced with the corresponding React component
 * at render time (via `parseShortcodes` + `useShortcodeHydration`).
 *
 * Naming convention: `<partner>-<topic>-<variant-number>`
 *   e.g. [cloudoora-wordpress-hosting-1], [ranksuite-keyword-1]
 *
 * Add a new shortcode by:
 *   1. Building a small React component below.
 *   2. Registering it in SHORTCODES with a unique key.
 *   3. (Optional) Add it to SHORTCODE_DOCS for the in-app docs.
 */
import { ArrowRight, Check, Server, Sparkles, Zap, Shield, Rocket, PenTool, Search, BarChart3, Globe, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

const trackAttrs = (source: string) => ({
  target: "_blank",
  rel: "sponsored noopener",
  "data-analytics": "cta-click",
  "data-cta-source": source,
});

// ===================== CLOUDOORA — HOSTING =====================
const CloudooraWordpressHosting1 = () => (
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
      <a href="https://cloudoora.com/wordpress-hosting/" {...trackAttrs("sc-cloudoora-wp-1")}>
        Claim deal <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

const CloudooraWordpressHosting2 = () => (
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
            <a href="https://cloudoora.com/turbo-boosted-hosting/" {...trackAttrs("sc-cloudoora-wp-2")}>
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
        { name: "Agency", price: "€4.99", note: "Reseller", href: "https://cloudoora.com/starter-reseller-hosting/" },
      ].map((p) => (
        <a
          key={p.name}
          href={p.href}
          {...trackAttrs("sc-cloudoora-compare")}
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

const CloudooraSecurity = () => (
  <aside className="not-prose my-8 rounded-2xl border border-success/20 bg-success/5 p-5 flex items-start gap-4">
    <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="font-display font-bold text-sm">🔒 আপনার সাইট কি সিকিউর hosting-এ আছে?</p>
      <p className="text-sm text-muted-foreground mt-1 font-bangla">
        Cloudoora দিচ্ছে free SSL, daily backup, ও CloudLinux isolation — সবই €2/mo এর নিচে।
      </p>
      <a
        href="https://cloudoora.com/pricing"
        {...trackAttrs("sc-cloudoora-security")}
        className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-2"
      >
        Cloudoora plans দেখুন <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  </aside>
);

const CloudooraSpeed = () => (
  <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5 flex flex-wrap items-center gap-4">
    <Gauge className="h-5 w-5 text-primary shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold tracking-wider uppercase text-primary">Speed-first hosting</p>
      <p className="font-display text-base font-bold leading-tight font-bangla">
        LiteSpeed + Redis — Core Web Vitals friendly
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 font-bangla">€2.60/mo থেকে</p>
    </div>
    <Button asChild variant="cta" size="sm" className="shrink-0">
      <a href="https://cloudoora.com/turbo-boosted-hosting/" {...trackAttrs("sc-cloudoora-speed")}>
        Get speed <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

// ===================== RANKSUITE — SEO / CONTENT =====================
const RankSuiteAutopilot = () => (
  <aside className="not-prose my-8 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 p-5 md:p-6">
    <div className="flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl bg-accent/15 text-accent grid place-items-center shrink-0">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider uppercase text-accent">RankSuite Pro · Autopilot</span>
        <h4 className="font-display text-lg font-bold leading-tight mt-0.5">
          পুরো content strategy plan + execute — একটাই AI টুলে
        </h4>
        <p className="text-sm text-muted-foreground mt-1.5 font-bangla">
          Topic cluster discovery → AI writing → scheduling → SEO audit।
        </p>
        <Button asChild variant="cta" size="sm" className="mt-3">
          <a href="https://ranksuitepro.com/user/registration" {...trackAttrs("sc-ranksuite-autopilot")}>
            Plan & Execute Free <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  </aside>
);

const RankSuiteKeyword = () => (
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
      <a href="https://ranksuitepro.com/user/registration" {...trackAttrs("sc-ranksuite-keyword")}>
        Try free <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

const RankSuiteWriter = () => (
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
      <a href="https://ranksuitepro.com/user/registration" {...trackAttrs("sc-ranksuite-writer")}>
        Generate first article <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

const RankSuiteAudit = () => (
  <aside className="not-prose my-8 rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 p-5 flex flex-wrap items-center gap-4">
    <BarChart3 className="h-5 w-5 text-accent shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold tracking-wider uppercase text-accent">Free SEO audit</p>
      <p className="font-display text-base font-bold leading-tight font-bangla">
        আপনার সাইটের SEO score এক ক্লিকে চেক করুন
      </p>
    </div>
    <Button asChild variant="cta" size="sm" className="shrink-0">
      <a href="https://ranksuitepro.com/user/registration" {...trackAttrs("sc-ranksuite-audit")}>
        Run audit <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Button>
  </aside>
);

// ===================== REGISTRY =====================
export type ShortcodeKey =
  | "cloudoora-wordpress-hosting-1"
  | "cloudoora-wordpress-hosting-2"
  | "cloudoora-compare-plans"
  | "cloudoora-security"
  | "cloudoora-speed"
  | "ranksuite-autopilot"
  | "ranksuite-keyword-1"
  | "ranksuite-writer"
  | "ranksuite-audit";

export const SHORTCODES: Record<ShortcodeKey, React.FC> = {
  "cloudoora-wordpress-hosting-1": CloudooraWordpressHosting1,
  "cloudoora-wordpress-hosting-2": CloudooraWordpressHosting2,
  "cloudoora-compare-plans": CloudooraComparePicks,
  "cloudoora-security": CloudooraSecurity,
  "cloudoora-speed": CloudooraSpeed,
  "ranksuite-autopilot": RankSuiteAutopilot,
  "ranksuite-keyword-1": RankSuiteKeyword,
  "ranksuite-writer": RankSuiteWriter,
  "ranksuite-audit": RankSuiteAudit,
};

export const SHORTCODE_DOCS: { key: ShortcodeKey; description: string }[] = [
  { key: "cloudoora-wordpress-hosting-1", description: "Cloudoora — WordPress hosting deal strip (€1.79/mo)" },
  { key: "cloudoora-wordpress-hosting-2", description: "Cloudoora — Turbo Boosted hosting spotlight" },
  { key: "cloudoora-compare-plans",       description: "Cloudoora — Starter / Pro / Agency 3-tier compare" },
  { key: "cloudoora-security",            description: "Cloudoora — security & SSL callout" },
  { key: "cloudoora-speed",               description: "Cloudoora — LiteSpeed/Core Web Vitals strip" },
  { key: "ranksuite-autopilot",           description: "RankSuite — Content Autopilot spotlight" },
  { key: "ranksuite-keyword-1",           description: "RankSuite — Keyword cluster quick-win" },
  { key: "ranksuite-writer",              description: "RankSuite — AI Writer feature card" },
  { key: "ranksuite-audit",               description: "RankSuite — Free SEO audit strip" },
];

/**
 * Replace `[shortcode-name]` tokens in raw HTML with mount-point divs that
 * `useShortcodeHydration` will later replace with React components.
 *
 * Tokens may appear:
 *   - on their own line (replaced as a block — the wrapping <p> is unwrapped),
 *   - inline inside a paragraph (also replaced as a block — the parent <p> is split).
 *
 * Unknown shortcodes are left alone so authors notice typos.
 */
export function parseShortcodes(html: string): string {
  if (!html) return html;
  const KNOWN = new Set(Object.keys(SHORTCODES));
  // Match [name-with-dashes-and-numbers]
  return html.replace(/\[([a-z0-9][a-z0-9-]*)\]/gi, (full, raw: string) => {
    const key = raw.toLowerCase();
    if (!KNOWN.has(key)) return full;
    return `<div data-shortcode-mount data-shortcode="${key}" class="not-prose my-2"></div>`;
  });
}
