import { ArrowRight, Sparkles, Target, PenTool, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * RankSuite Pro — AI-powered SEO platform affiliate CTA.
 * Source: https://ranksuitepro.com
 */
type Props = {
  variant?: "hero" | "compact" | "inline";
};

const FEATURES = [
  { icon: Target, label: "Ideas & Trends", desc: "Keyword + topic discovery" },
  { icon: PenTool, label: "AI Content Writer", desc: "Quick / Expert / Bulk modes" },
  { icon: BarChart3, label: "SEO Analyzer", desc: "Site audit + indexing insight" },
  { icon: Sparkles, label: "Content Autopilot", desc: "Plan → Write → Schedule" },
];

const SeoToolsCTA = ({ variant = "hero" }: Props) => {
  if (variant === "inline") {
    return (
      <aside className="not-prose my-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            Sponsored · RankSuite Pro
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            AI SEO + Content Strategy
          </span>
        </div>
        <h4 className="font-display text-lg md:text-xl font-bold leading-tight">
          পুরো সাইটের কনটেন্ট স্ট্র্যাটেজি প্ল্যান + execute করুন একটাই টুলে
        </h4>
        <p className="text-sm text-muted-foreground mt-1.5 font-bangla">
          RankSuite Pro দিয়ে কীওয়ার্ড গবেষণা থেকে topic cluster, AI কনটেন্ট রাইটিং, scheduling ও SEO audit
          — A থেকে Z পর্যন্ত একটাই ড্যাশবোর্ডে।
        </p>
        <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-xs">
              <f.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold">{f.label}</span>
              <span className="text-muted-foreground truncate">— {f.desc}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild variant="cta" size="sm">
            <a
              href="https://ranksuitepro.com/user/registration"
              target="_blank"
              rel="sponsored noopener"
              data-analytics="cta-click"
              data-cta-source="inline-seo-tool"
              data-cta-label="RankSuite Inline"
            >
              Plan & Execute Free <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <span className="text-[11px] text-muted-foreground">
            No credit card · Content Autopilot included
          </span>
        </div>
      </aside>
    );
  }

  if (variant === "compact") {
    return (
      <div className="card-premium p-5 bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-accent" />
          <h4 className="font-display text-sm font-bold uppercase tracking-wider">
            SEO Tool Pick
          </h4>
        </div>
        <h5 className="font-display text-lg font-bold mt-1">RankSuite Pro</h5>
        <p className="text-xs text-muted-foreground mt-1 font-bangla">
          AI-powered keyword research, content writing ও site audit — সব এক প্ল্যাটফর্মে।
        </p>
        <ul className="mt-3 space-y-1.5">
          {FEATURES.slice(0, 3).map((f) => (
            <li key={f.label} className="flex items-center gap-2 text-xs">
              <f.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-semibold">{f.label}</span>
              <span className="text-muted-foreground truncate">— {f.desc}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="cta" size="sm" className="w-full mt-4">
          <a
            href="https://ranksuitepro.com/user/registration"
            target="_blank"
            rel="sponsored noopener"
            data-analytics="cta-click"
            data-cta-source="sidebar-seo-tool"
            data-cta-label="RankSuite Free"
          >
            Start Free <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          No credit card required
        </p>
      </div>
    );
  }

  return (
    <section className="not-prose my-10 rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 md:p-10">
      <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-3">
            Recommended SEO Tool
          </span>
          <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            RankSuite Pro — AI-Powered SEO Platform
          </h3>
          <p className="text-muted-foreground mt-2 font-bangla">
            Research, plan, write এবং SEO analyze — সব একটাই প্ল্যাটফর্মে। কম পরিশ্রমে দ্রুত
            অর্গানিক ট্র্যাফিক বাড়ান।
          </p>
        </div>
        <Button asChild variant="cta" size="lg" className="shrink-0">
          <a
            href="https://ranksuitepro.com/user/registration"
            target="_blank"
            rel="sponsored noopener"
            data-analytics="cta-click"
            data-cta-source="seo-tools-cta"
            data-cta-label="RankSuite Hero"
          >
            Start Free with RankSuite <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {FEATURES.map((f) => (
          <div key={f.label} className="rounded-2xl bg-background/60 backdrop-blur p-4 border border-border">
            <f.icon className="h-5 w-5 text-primary mb-2" />
            <div className="font-bold text-sm">{f.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeoToolsCTA;
