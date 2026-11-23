import { ArrowRight, Check, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cloudoora hosting plan affiliate cards.
 * Pricing & feature lists pulled from https://cloudoora.com/pricing
 */
export type HostingPlanKey =
  | "wordpress"
  | "premium"
  | "turbo"
  | "reseller"
  | "vps"
  | "cloud";

type Plan = {
  key: HostingPlanKey;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  href: string;
  highlight?: boolean;
};

const PLANS: Record<HostingPlanKey, Plan> = {
  wordpress: {
    key: "wordpress",
    name: "WordPress Hosting",
    price: "€1.79/mo",
    tagline: "শুরু করার জন্য পারফেক্ট",
    features: ["10 Websites", "20 GB SSD", "WordPress pre-installed", "cPanel access"],
    href: "https://cloudoora.com/wordpress-hosting/",
  },
  premium: {
    key: "premium",
    name: "Premium Shared",
    price: "€2.00/mo",
    tagline: "Daily backup + NVMe",
    features: ["20 Websites", "30 GB NVMe", "Daily backups", "99.9% uptime"],
    href: "https://cloudoora.com/premium-shared-hosting/",
    highlight: true,
  },
  turbo: {
    key: "turbo",
    name: "Turbo Boosted",
    price: "€2.60/mo",
    tagline: "LiteSpeed + Redis cache",
    features: ["Unlimited Sites", "50 GB NVMe", "LiteSpeed + Redis", "CloudLinux isolation"],
    href: "https://cloudoora.com/turbo-boosted-hosting/",
  },
  reseller: {
    key: "reseller",
    name: "Reseller Hosting",
    price: "€4.99/mo",
    tagline: "Agency / Reseller ready",
    features: ["25 cPanel accounts", "WHMCS license", "100% white-label", "40 GB SSD"],
    href: "https://cloudoora.com/starter-reseller-hosting/",
  },
  vps: {
    key: "vps",
    name: "VPS",
    price: "€4.61/mo",
    tagline: "Power user / dev",
    features: ["2 vCPU", "4 GB RAM", "40 GB NVMe", "20 TB traffic"],
    href: "https://cloudoora.com/virtual-private-server/",
  },
  cloud: {
    key: "cloud",
    name: "Cloud Hosting",
    price: "€8.81/mo",
    tagline: "Scalable + free SSL",
    features: ["2 GB RAM, 2 CPU", "Unmetered SSD", "Unlimited Email", "Free SSL & cPanel"],
    href: "https://cloudoora.com/cloud-hosting/",
  },
};

const ALL: HostingPlanKey[] = ["wordpress", "premium", "turbo", "reseller", "vps", "cloud"];

type Props = {
  plans?: HostingPlanKey[];
  variant?: "grid" | "compact" | "inline";
  title?: string;
  subtitle?: string;
};

const HostingPlans = ({
  plans = ["wordpress", "premium", "turbo"],
  variant = "grid",
  title = "Recommended Hosting Plans",
  subtitle = "Cloudoora — দ্রুত, সিকিউর ও সাশ্রয়ী হোস্টিং। আপনার সাইটের জন্য পারফেক্ট প্ল্যান বেছে নিন।",
}: Props) => {
  const list = (plans?.length ? plans : ALL).map((k) => PLANS[k]).filter(Boolean);

  if (variant === "inline") {
    const top = list.slice(0, 3);
    return (
      <aside className="not-prose my-8 rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              Sponsored · Cloudoora
            </span>
            <span className="font-display text-sm md:text-base font-semibold truncate">
              Recommended Hosting
            </span>
          </div>
          <a
            href="https://cloudoora.com/pricing"
            target="_blank"
            rel="sponsored noopener"
            data-analytics="cta-click"
            data-cta-source="inline-hosting"
            data-cta-label="Compare all"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Compare all <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {top.map((p) => (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="sponsored noopener"
              data-analytics="cta-click"
              data-cta-source="inline-hosting"
              data-cta-label={p.name}
              className={`group rounded-xl border p-4 hover:border-primary hover:shadow-premium-sm transition ${
                p.highlight ? "border-primary/40 bg-primary/5" : "border-border bg-background"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold truncate">{p.name}</span>
                {p.highlight && (
                  <span className="text-[9px] font-bold tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="font-display text-xl font-black text-primary mt-1">{p.price}</div>
              <p className="text-[11px] text-muted-foreground font-bangla mt-0.5 line-clamp-1">
                {p.tagline}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                Get deal <ArrowRight className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
      </aside>
    );
  }

  if (variant === "compact") {
    return (
      <div className="card-premium p-5">
        <div className="flex items-center gap-2 mb-1">
          <Server className="h-4 w-4 text-primary" />
          <h4 className="font-display text-sm font-bold uppercase tracking-wider">
            Hosting Deals
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mb-3 font-bangla">
          Cloudoora — সাশ্রয়ী ও ফাস্ট হোস্টিং
        </p>
        <ul className="space-y-2.5">
          {list.slice(0, 3).map((p) => (
            <li key={p.key}>
              <a
                href={p.href}
                target="_blank"
                rel="sponsored noopener"
                data-analytics="cta-click"
                data-cta-source="sidebar-hosting"
                data-cta-label={p.name}
                className="flex items-center justify-between gap-2 group"
              >
                <span className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                  {p.name}
                </span>
                <span className="text-xs font-bold text-primary shrink-0">{p.price}</span>
              </a>
            </li>
          ))}
        </ul>
        <Button
          asChild
          variant="cta"
          size="sm"
          className="w-full mt-4"
        >
          <a
            href="https://cloudoora.com/pricing"
            target="_blank"
            rel="sponsored noopener"
            data-analytics="cta-click"
            data-cta-source="sidebar-hosting"
            data-cta-label="Compare all plans"
          >
            Compare All Plans <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <section className="not-prose my-10">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
          Sponsored · Cloudoora
        </span>
      </div>
      <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
      {subtitle && <p className="text-muted-foreground mt-1 font-bangla">{subtitle}</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {list.map((p) => (
          <div
            key={p.key}
            className={`card-premium p-5 flex flex-col ${
              p.highlight ? "ring-2 ring-primary/40 relative" : ""
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-2 right-4 text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                POPULAR
              </span>
            )}
            <h4 className="font-display text-lg font-bold">{p.name}</h4>
            <p className="text-xs text-muted-foreground font-bangla">{p.tagline}</p>
            <div className="mt-3 mb-4">
              <span className="font-display text-3xl font-black text-primary">{p.price}</span>
            </div>
            <ul className="space-y-1.5 text-sm flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="cta" size="sm" className="mt-5 w-full">
              <a
                href={p.href}
                target="_blank"
                rel="sponsored noopener"
                data-analytics="cta-click"
                data-cta-source="hosting-plans"
                data-cta-label={p.name}
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HostingPlans;
