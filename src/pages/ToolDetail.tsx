import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Star, Check, ChevronRight, Trophy, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategory, usePost, useTool, useToolsByCategory } from "@/lib/cms";
import type { ToolCategory as ToolCategorySlug } from "@/data/tools";
import { sanitizeHtml } from "@/lib/sanitize";
import SEO from "@/components/SEO";

const ToolDetail = () => {
  const { category, slug } = useParams();
  const cat = category as ToolCategorySlug | undefined;
  const { data: meta, isLoading: catLoading } = useCategory(cat);
  const { data: tool, isLoading: toolLoading } = useTool(cat, slug);
  const { data: catTools = [] } = useToolsByCategory(cat);
  const { data: wpPost, isLoading: wpLoading } = usePost(slug);
  const loading = catLoading || toolLoading;
  if (!loading && (!meta || !tool)) return <Navigate to="/tools" replace />;
  if (!meta || !tool) {
    return <div className="container-app py-32 text-center text-muted-foreground font-bangla">লোড হচ্ছে...</div>;
  }
  const related = catTools.filter((t) => t.slug !== tool.slug).slice(0, 3);

  const seoTitle = tool.seo?.title ?? `${tool.name} Review — ${meta.title} | Affiliate Guidance`;
  const seoDesc = tool.seo?.description ?? (tool.tagline || tool.benefit || `${tool.name} review, features, pricing ও honest recommendation।`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: meta.title,
    operatingSystem: "Web",
    description: seoDesc,
    offers: { "@type": "Offer", price: tool.price, priceCurrency: "USD" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tool.rating,
      bestRating: 5,
      ratingCount: 1,
    },
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords={tool.seo?.keywords}
        canonical={tool.seo?.canonical ?? `/tools/${meta.slug}/${tool.slug}`}
        image={tool.image}
        robots={tool.seo?.robots}
        type="article"
        schemaHead={(tool.seo as any)?.schemaHead}
        jsonLd={jsonLd}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-12 md:py-16">
          <div className="text-xs flex items-center gap-2 mb-6 text-muted-foreground">
            <Link to="/tools" className="hover:text-primary">Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/tools/${meta.slug}`} className="hover:text-primary">{meta.title}</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{tool.name}</span>
          </div>

          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${tool.color} grid place-items-center text-white font-display font-bold text-4xl shadow-premium-md`}>
              {tool.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{meta.title}</span>
                {tool.topPick && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">
                    <Trophy className="h-3 w-3" /> Top Pick
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{tool.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground font-bangla">{tool.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-secondary inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {tool.rating}/5
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary font-semibold text-primary">{tool.price}</span>
                {tool.freeTrial && <span className="px-3 py-1 rounded-full bg-success/10 text-success font-semibold">✓ Free Trial</span>}
                {tool.beginnerFriendly && <span className="px-3 py-1 rounded-full bg-success/10 text-success font-semibold">✓ Beginner Friendly</span>}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero" size="lg">{meta.cta}</Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <Link to={`/tools/${meta.slug}`}>← সব {meta.title}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-10">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="card-premium p-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Benefit</h3>
            <p className="text-sm text-muted-foreground font-bangla">{tool.benefit}</p>
          </div>
          <div className="card-premium p-6 border-primary/30">
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Why I Recommend</h3>
            <p className="text-sm text-muted-foreground font-bangla">{tool.whyRecommend}</p>
          </div>
          <div className="card-premium p-6">
            <div className="h-10 w-10 rounded-lg bg-success/15 grid place-items-center mb-3">
              <Check className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-bold mb-2">Beginner Note</h3>
            <p className="text-sm text-muted-foreground font-bangla">{tool.beginnerNote}</p>
          </div>
        </div>
      </section>

{(() => {
        const html = ((tool as any)?.content?.trim?.() || (!wpLoading && wpPost?.content?.trim())) || "";
        if (!html) return null;
        return (
          <section className="container-app py-8">
            <div className="max-w-4xl mx-auto">
              <article className="wp-prose prose-content font-bangla text-[17px] leading-[1.85]">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
              </article>
            </div>
          </section>
        );
      })()}

      {/* MID CTA */}
      <section className="container-app py-6">
        <div className="rounded-2xl bg-gradient-primary p-6 md:p-8 text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold font-bangla">এখনই {tool.name} নিয়ে শুরু করুন</h3>
            <p className="text-sm opacity-90 font-bangla">Honest recommendation — আমি নিজেও use করছি।</p>
          </div>
          <Button variant="hero-outline" size="lg" className="bg-white text-foreground border-white hover:bg-white/90">
            🔥 {meta.cta}
          </Button>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-pad">
          <div className="container-app">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">Related {meta.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((t) => (
                <Link key={t.slug} to={`/tools/${t.category}/${t.slug}`} className="card-premium p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${t.color} grid place-items-center text-white font-bold`}>
                      {t.initials}
                    </div>
                    {t.badge && <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">{t.badge}</span>}
                  </div>
                  <h3 className="font-bold text-lg">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{t.tagline}</p>
                  <p className="text-sm text-muted-foreground font-bangla flex-1">{t.benefit}</p>
                  <span className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1">
                    Details <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ToolDetail;
