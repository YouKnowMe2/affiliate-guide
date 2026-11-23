/**
 * Sidebar mini affiliate widgets — small, single-CTA cards designed to fit
 * the blog post sidebar. Multiple variations exist for each partner family
 * (Cloudoora / RankSuite); `MiniSidebarCloudoora` and `MiniSidebarRanksuite`
 * pick one at random per mount so the sidebar feels fresh between visits
 * but stable during a single page view.
 */
import { useMemo } from "react";
import { ArrowRight, Server, Zap, Shield, Sparkles, Search, BarChart3, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mini = { eyebrow: string; title: string; sub?: string; href: string; cta: string; Icon: React.ComponentType<{ className?: string }>; tone: "primary" | "accent" | "success" };

const CLOUDOORA_VARIANTS: Mini[] = [
  {
    eyebrow: "Cloudoora · Hosting",
    title: "WordPress hosting €1.79/mo",
    sub: "Free SSL · cPanel · NVMe",
    href: "https://cloudoora.com/wordpress-hosting/",
    cta: "Claim deal",
    Icon: Zap,
    tone: "primary",
  },
  {
    eyebrow: "Cloudoora · Turbo",
    title: "LiteSpeed + Redis hosting",
    sub: "Core Web Vitals friendly · €2.60/mo",
    href: "https://cloudoora.com/turbo-boosted-hosting/",
    cta: "Try Turbo",
    Icon: Server,
    tone: "primary",
  },
  {
    eyebrow: "Cloudoora · Secure",
    title: "Free SSL · Daily backup",
    sub: "CloudLinux isolation included",
    href: "https://cloudoora.com/pricing",
    cta: "See plans",
    Icon: Shield,
    tone: "success",
  },
];

const RANKSUITE_VARIANTS: Mini[] = [
  {
    eyebrow: "RankSuite · AI",
    title: "Content Autopilot — free start",
    sub: "Plan + write + audit, এক টুলে",
    href: "https://ranksuitepro.com/user/registration",
    cta: "Start free",
    Icon: Sparkles,
    tone: "accent",
  },
  {
    eyebrow: "RankSuite · Keywords",
    title: "AI keyword cluster ৫ মিনিটে",
    sub: "Volume + intent এক ক্লিকে",
    href: "https://ranksuitepro.com/user/registration",
    cta: "Try free",
    Icon: Search,
    tone: "accent",
  },
  {
    eyebrow: "RankSuite · Audit",
    title: "Free SEO audit আপনার সাইটের",
    sub: "এক ক্লিকে full report",
    href: "https://ranksuitepro.com/user/registration",
    cta: "Run audit",
    Icon: BarChart3,
    tone: "accent",
  },
  {
    eyebrow: "RankSuite · Writer",
    title: "AI Writer — SEO optimized",
    sub: "Quick · Expert · Bulk modes",
    href: "https://ranksuitepro.com/user/registration",
    cta: "Generate",
    Icon: PenTool,
    tone: "accent",
  },
];

const TONE_CLASSES: Record<Mini["tone"], { wrap: string; icon: string; eyebrow: string }> = {
  primary: {
    wrap: "border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card",
    icon: "bg-primary/15 text-primary",
    eyebrow: "text-primary",
  },
  accent: {
    wrap: "border-accent/25 bg-gradient-to-br from-accent/10 via-card to-card",
    icon: "bg-accent/15 text-accent",
    eyebrow: "text-accent",
  },
  success: {
    wrap: "border-success/25 bg-gradient-to-br from-success/10 via-card to-card",
    icon: "bg-success/15 text-success",
    eyebrow: "text-success",
  },
};

const MiniCard = ({ data, source }: { data: Mini; source: string }) => {
  const t = TONE_CLASSES[data.tone];
  const { Icon } = data;
  return (
    <aside className={`relative overflow-hidden rounded-2xl border ${t.wrap} p-5 mx-0 my-0`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${t.eyebrow}`}>
            {data.eyebrow}
          </p>
          <h4 className="font-display text-sm font-bold leading-tight font-bangla">
            {data.title}
          </h4>
        </div>
      </div>
      {data.sub && (
        <p className="text-xs text-muted-foreground font-bangla mb-3 leading-relaxed">
          {data.sub}
        </p>
      )}
      <Button asChild variant="cta" size="sm" className="w-full">
        <a
          href={data.href}
          target="_blank"
          rel="sponsored noopener"
          data-analytics="cta-click"
          data-cta-source={source}
        >
          {data.cta} <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </Button>
    </aside>
  );
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const MiniSidebarCloudoora = () => {
  const data = useMemo(() => pickRandom(CLOUDOORA_VARIANTS), []);
  return <MiniCard data={data} source="sidebar-mini-cloudoora" />;
};

export const MiniSidebarRanksuite = () => {
  const data = useMemo(() => pickRandom(RANKSUITE_VARIANTS), []);
  return <MiniCard data={data} source="sidebar-mini-ranksuite" />;
};
