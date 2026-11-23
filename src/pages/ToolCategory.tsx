import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Star, Check, X, Trophy, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategory, useToolsByCategory } from "@/lib/cms";
import type { ToolCategory as ToolCategorySlug } from "@/data/tools";
import SEO from "@/components/SEO";
import HostingPlans from "@/components/affiliate/HostingPlans";
import SeoToolsCTA from "@/components/affiliate/SeoToolsCTA";

const FAQ = [
  { q: "কোন tool আমার জন্য best?", a: "আপনার budget ও experience অনুযায়ী top pick দেখুন — সেটাই beginner-দের জন্য proven choice।" },
  { q: "Free tools দিয়ে কি কাজ চলবে?", a: "শুরুতে free version দিয়ে চালানো যায়, কিন্তু serious income শুরু হলে paid tool-এ invest করতেই হবে।" },
  { q: "Refund পাবো কি?", a: "অধিকাংশ tool-এ ৭–৩০ দিনের money-back guarantee থাকে — না পসন্দ হলে refund নিতে পারবেন।" },
  { q: "Bangladesh থেকে payment করা যাবে?", a: "Dual-currency card বা international card থাকলে directly payment হবে। অন্যথায় bKash → Payoneer বা reseller থেকে নিতে পারবেন।" },
];

const ToolCategory = () => {
  const { category } = useParams();
  const slug = category as ToolCategorySlug | undefined;
  const { data: meta, isLoading } = useCategory(slug);
  const { data: items = [] } = useToolsByCategory(slug);
  if (!isLoading && !meta) return <Navigate to="/tools" replace />;
  if (!meta) {
    return <div className="container-app py-32 text-center text-muted-foreground font-bangla">লোড হচ্ছে...</div>;
  }
  const top = items.find((t) => t.topPick) ?? items[0];

  return (
    <>
      <SEO
        title={meta.seo?.title ?? `${meta.title} — Best Tools | Affiliate Guidance`}
        description={meta.seo?.description ?? (meta.shortDesc || `${meta.title} ক্যাটাগরির হাতে বাছাই করা tools — পরীক্ষিত, beginner friendly ও affiliate marketing-এর জন্য recommended।`)}
        keywords={meta.seo?.keywords}
        canonical={meta.seo?.canonical ?? `/tools/${slug}`}
        robots={meta.seo?.robots}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${meta.title} — Best Tools`,
          hasPart: {
            "@type": "ItemList",
            itemListElement: items.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `/tools/${slug}/${t.slug}`,
              name: t.name,
            })),
          },
        }}
      />
      {/* BREADCRUMB + HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-14 md:py-20">
          <div className="text-xs flex items-center gap-2 mb-5 text-muted-foreground">
            <Link to="/tools" className="hover:text-primary">Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{meta.title}</span>
          </div>
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-br ${meta.color} text-white text-xs font-semibold mb-4`}>
              {meta.icon} {meta.title}
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight font-bangla">
              Beginners জন্য <span className="gradient-text">সেরা {meta.title}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground font-bangla">{meta.hook}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="hero" size="lg">{meta.cta}</Button>
              <Button variant="hero-outline" size="lg" asChild>
                <a href="#comparison">📊 Comparison দেখুন</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TOP PICK HIGHLIGHT */}
      {top && (
        <section className="container-app -mt-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white p-8 md:p-12">
            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold mb-4">
                  <Trophy className="h-3 w-3" /> TOP PICK · Personally Tested
                </div>
                <h2 className="font-display text-2xl md:text-4xl font-bold mb-2">{top.name}</h2>
                <p className="text-white/85 font-bangla">{top.benefit}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur">⭐ {top.rating}</span>
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur">💰 {top.price}</span>
                  {top.freeTrial && <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur">✓ Free Trial</span>}
                  {top.beginnerFriendly && <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur">✓ Beginner Friendly</span>}
                </div>
              </div>
              <Button variant="hero-outline" size="xl" className="bg-white text-foreground border-white hover:bg-white/90">
                🚀 শুরু করুন এখনই
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON TABLE */}
      <section id="comparison" className="section-pad">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold">📊 Quick <span className="gradient-text">Comparison</span></h2>
            <p className="mt-3 text-muted-foreground font-bangla">এক নজরে সব option-এর তুলনা।</p>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-secondary text-left">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Tool</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    {meta.slug === "hosting" && <th className="px-5 py-4 font-semibold">Speed</th>}
                    <th className="px-5 py-4 font-semibold">Rating</th>
                    <th className="px-5 py-4 font-semibold">Free Trial</th>
                    <th className="px-5 py-4 font-semibold">Beginner</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t, i) => (
                    <tr key={t.slug} className={i % 2 ? "bg-surface" : ""}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${t.color} grid place-items-center text-white font-bold text-sm`}>
                            {t.initials}
                          </div>
                          <div>
                            <div className="font-semibold">{t.name}</div>
                            {t.topPick && <span className="text-[10px] uppercase text-warning font-bold">Top Pick</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">{t.price}</td>
                      {meta.slug === "hosting" && <td className="px-5 py-4">{t.speed ?? "—"}</td>}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {t.rating}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {t.freeTrial ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </td>
                      <td className="px-5 py-4">
                        {t.beginnerFriendly ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="soft" size="sm" asChild>
                          <Link to={`/tools/${t.category}/${t.slug}`}>Details</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED REVIEWS */}
      <section className="section-pad bg-surface">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">📝 Detailed <span className="gradient-text">Reviews</span></h2>
            <p className="mt-3 text-muted-foreground font-bangla">প্রতিটি tool-এর honest analysis — আমার নিজের experience থেকে।</p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {items.map((t) => (
              <div key={t.slug} className="card-premium p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${t.color} grid place-items-center text-white font-display font-bold text-xl shadow-premium-md`}>
                      {t.initials}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{t.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.badge && <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">{t.badge}</span>}
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{t.price}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-1">Why I Recommend</p>
                    <p className="text-sm font-bangla">{t.whyRecommend}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/5 border border-success/15">
                    <p className="text-xs uppercase tracking-wider font-semibold text-success mb-1">Beginner Note</p>
                    <p className="text-sm font-bangla">{t.beginnerNote}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground font-bangla">{t.benefit}</p>

                <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                  <Link to={`/tools/${t.category}/${t.slug}`} className="text-sm font-semibold text-primary hover:underline">
                    Full Review পড়ুন →
                  </Link>
                  <Button variant="cta">{meta.cta}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              FAQ
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Common <span className="gradient-text">Questions</span></h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card-premium p-5 group">
                <summary className="font-semibold cursor-pointer flex items-center justify-between font-bangla">
                  {f.q}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground font-bangla leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-pad pt-0">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-dark text-white p-10 md:p-16 text-center">
            <div className="absolute inset-0 -z-0 mesh-bg opacity-50" />
            <div className="relative max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold mb-4">
                <Sparkles className="h-3 w-3" /> হাজারো beginner ব্যবহার করছে
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight font-bangla">
                দেরি না করে <span className="gradient-text">এখনই শুরু করুন</span>
              </h2>
              <p className="mt-4 text-white/75 font-bangla">আজ শুরু করলে কাল earning-এর পথে থাকবেন।</p>
              <Button variant="hero" size="xl" className="mt-7">{meta.cta}</Button>
            </div>
          </div>
        </div>
      </section>

      {meta.slug === "hosting" && (
        <section className="container-app">
          <HostingPlans plans={["wordpress", "premium", "turbo", "reseller", "vps", "cloud"]} />
        </section>
      )}
      {(meta.slug === "seo" || meta.slug === "keyword") && (
        <section className="container-app">
          <SeoToolsCTA variant="hero" />
        </section>
      )}
    </>
  );
};

export default ToolCategory;
