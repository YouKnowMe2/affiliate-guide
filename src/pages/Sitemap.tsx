import { Link } from "react-router-dom";
import { useMemo } from "react";
import { usePages } from "@/lib/cms";
import { PAGE_TEMPLATES, type TemplateVariant } from "./wp/pageTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FileCode2 } from "lucide-react";
import SEO from "@/components/SEO";

const SITEMAP_XML_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const variantLabels: Record<TemplateVariant, { bn: string; icon: string }> = {
  guide:     { bn: "গাইডস",        icon: "📘" },
  reviews:   { bn: "রিভিউ",        icon: "⭐" },
  resources: { bn: "রিসোর্স",      icon: "🎁" },
  tools:     { bn: "টুলস",          icon: "🛠️" },
  tutorial:  { bn: "টিউটোরিয়াল",   icon: "🎓" },
  about:     { bn: "আমাদের সম্পর্কে", icon: "🌟" },
  contact:   { bn: "যোগাযোগ",       icon: "✉️" },
  legal:     { bn: "আইনি",          icon: "📜" },
  default:   { bn: "অন্যান্য",       icon: "✨" },
};

const Sitemap = () => {
  const { data: pages = [], isLoading } = usePages();

  const grouped = useMemo(() => {
    const map = new Map<TemplateVariant, { title: string; to: string; excerpt: string }[]>();
    pages.forEach((p) => {
      const tpl = PAGE_TEMPLATES.find((t) => t.slug === p.slug);
      const variant: TemplateVariant = tpl?.variant ?? "default";
      const to = tpl?.path ?? `/p/${p.slug}`;
      const list = map.get(variant) ?? [];
      list.push({ title: stripHtml(p.title) || p.slug, to, excerpt: stripHtml(p.excerpt) });
      map.set(variant, list);
    });
    return map;
  }, [pages]);

  return (
    <main>
      <SEO
        title="Sitemap — Affiliate Guidance"
        description="Affiliate Guidance-এর সব পেজ এক জায়গায়। গাইড, রিভিউ, টুলস ও রিসোর্স ক্যাটেগরি অনুযায়ী সাজানো।"
        canonical="/sitemap"
      />
      <section className="container-app py-16 md:py-24">
        <div className="max-w-3xl mb-12">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Sitemap</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            সব পেজ এক জায়গায়
          </h1>
          <p className="text-lg text-muted-foreground mb-5">
            Affiliate Guidance-এর প্রতিটি গাইড, রিভিউ, টুল ও রিসোর্স পেজ ক্যাটেগরি অনুযায়ী সাজানো।
          </p>
          <a
            href={SITEMAP_XML_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
          >
            <FileCode2 className="h-4 w-4" /> XML Sitemap (search engines)
          </a>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(grouped.entries()).map(([variant, items]) => {
              const meta = variantLabels[variant];
              return (
                <div key={variant} className="rounded-2xl bg-card border border-border p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <span className="text-xl">{meta.icon}</span>
                    <h2 className="font-display text-lg font-semibold">{meta.bn}</h2>
                    <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {items.map((p) => (
                      <li key={p.to}>
                        <Link
                          to={p.to}
                          className="group flex items-start gap-2 text-sm hover:text-primary transition-colors font-bangla"
                        >
                          <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0 opacity-50 group-hover:opacity-100" />
                          <span className="line-clamp-2">{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Sitemap;
