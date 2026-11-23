import { Link } from "react-router-dom";
import { ArrowRight, Star, Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories, useTools } from "@/lib/cms";
import SEO from "@/components/SEO";
import HostingPlans from "@/components/affiliate/HostingPlans";
import SeoToolsCTA from "@/components/affiliate/SeoToolsCTA";

const Tools = () => {
  const { data: categories = [] } = useCategories();
  const { data: tools = [] } = useTools();
  return (
    <>
      <SEO
        title="Best Tools for Affiliate Marketing — Affiliate Guidance"
        description="Affiliate marketing-এর জন্য hand-picked best tools — hosting, SEO, keyword research, email marketing, page builder ও আরও।"
        canonical="/tools"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Best Tools for Affiliate Marketing",
          hasPart: {
            "@type": "ItemList",
            itemListElement: tools.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `/tools/${t.category}/${t.slug}`,
              name: t.name,
            })),
          },
        }}
      />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4">
            <Flame className="h-3 w-3" /> RECOMMENDED TOOLS
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Best Tools for <span className="gradient-text">Affiliate Marketing</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto font-bangla text-lg">
            শুধু সেই tools যেগুলো আমি personally test করেছি। প্রতিটি category-তে honest recommendation।
          </p>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="container-app pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => {
            const count = tools.filter((t) => t.category === c.slug).length;
            return (
              <Link
                key={c.slug}
                to={`/tools/${c.slug}`}
                className="card-premium p-6 group flex flex-col"
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${c.color} grid place-items-center text-3xl mb-5 shadow-premium-md group-hover:scale-110 transition-transform`}>
                  {c.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground font-bangla flex-1 mb-4">{c.shortDesc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">{count} tools</span>
                  <span className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    দেখুন <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ALL TOOLS QUICK LIST */}
      <section className="section-pad">
        <div className="container-app">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">All <span className="gradient-text">Recommended</span> Tools</h2>
              <p className="text-muted-foreground mt-2 font-bangla">এক জায়গায় সব tools — quick browse করুন।</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Link
                key={t.slug + t.category}
                to={`/tools/${t.category}/${t.slug}`}
                className="card-premium p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${t.color} grid place-items-center text-white font-display font-bold text-xl shadow-premium-md`}>
                    {t.initials}
                  </div>
                  {t.badge && (
                    <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">{t.badge}</span>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold">{t.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 capitalize">{t.category} · {t.tagline}</p>
                <p className="text-sm text-muted-foreground font-bangla flex-1 mb-4">{t.benefit}</p>
                <div className="flex items-center justify-between mb-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold">{t.rating}</span>
                  </div>
                  <span className="text-sm font-semibold">{t.price}</span>
                </div>
                <Button variant="cta" className="w-full">👉 এখনই চেক করুন</Button>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <SeoToolsCTA variant="hero" />
            <HostingPlans />
          </div>
        </div>
      </section>
    </>
  );
};

export default Tools;
