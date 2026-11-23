import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Tag as TagIcon, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostTag, useTools } from "@/lib/cms";
import type { ToolCategory } from "@/data/tools";
import SEO from "@/components/SEO";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const TOOL_CATS: ToolCategory[] = ["hosting", "seo", "keyword", "email"];

const Tag = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePostTag(slug);
  const { data: allTools = [] } = useTools();

  const decoded = slug ? decodeURIComponent(slug) : "";
  const matchedCat = TOOL_CATS.find((c) => c === decoded) as ToolCategory | undefined;
  const relatedTools = matchedCat
    ? allTools.filter((t) => t.category === matchedCat)
    : [];

  if (isLoading) {
    return (
      <section className="container-app py-24 text-center">
        <div className="animate-pulse text-muted-foreground">লোড হচ্ছে…</div>
      </section>
    );
  }

  if (!data?.item) {
    return (
      <section className="container-app py-24 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">ট্যাগ পাওয়া যায়নি</h1>
        <Button asChild variant="cta">
          <Link to="/blog"><ArrowLeft className="h-4 w-4" /> ব্লগে ফিরুন</Link>
        </Button>
      </section>
    );
  }

  const { item, posts } = data;
  const [featured, ...rest] = posts;

  return (
    <>
      <SEO
        title={item.seo?.title ?? `#${stripHtml(item.name)} — Affiliate Guidance`}
        description={item.seo?.description ?? `${stripHtml(item.name)} ট্যাগের সব পোস্ট, গাইড ও টুলস এক জায়গায়। মোট ${posts.length} টি পোস্ট।`}
        keywords={item.seo?.keywords}
        canonical={item.seo?.canonical ?? `/tag/${encodeURIComponent(item.slug)}`}
        robots={item.seo?.robots}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-20">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> ব্লগে ফিরুন
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <TagIcon className="h-3.5 w-3.5" /> TAG · {posts.length} পোস্ট
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight font-bangla">
            #{stripHtml(item.name)}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl font-bangla">
            "{stripHtml(item.name)}" ট্যাগের সাথে সম্পর্কিত সব পোস্ট ও টুলস এক জায়গায়।
          </p>
        </div>
      </section>

      <section className="container-app pb-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            এই ট্যাগে এখনও কোনো পোস্ট নেই।
          </div>
        ) : (
          <>
            {featured && (
              <Link
                to={`/${featured.slug}`}
                className="card-premium overflow-hidden grid md:grid-cols-2 mb-10 group"
              >
                {featured.image && (
                  <div className="aspect-video md:aspect-auto overflow-hidden bg-secondary">
                    <img
                      src={featured.image}
                      alt={stripHtml(featured.title)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      FEATURED · {featured.contentType}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight font-bangla group-hover:text-primary transition-colors">
                    {stripHtml(featured.title)}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-3 text-muted-foreground font-bangla line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="mt-5 text-xs text-muted-foreground flex items-center gap-3">
                    <span>{featured.author}</span> · <span>{featured.date}</span> · <span>{featured.readTime}</span>
                  </div>
                  <Button variant="cta" className="mt-6 self-start">
                    Read More <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((p) => (
                <Link
                  key={p.slug}
                  to={`/${p.slug}`}
                  className="card-premium overflow-hidden group"
                >
                  {p.image ? (
                    <div className="aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={p.image}
                        alt={stripHtml(p.title)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-secondary" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {p.contentType}
                      </span>
                      <span>·</span>
                      <span>{p.readTime}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-snug font-bangla group-hover:text-primary transition-colors line-clamp-3">
                      {stripHtml(p.title)}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 font-bangla">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {relatedTools.length > 0 && (
        <section className="container-app pb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <Wrench className="h-3.5 w-3.5" /> RELATED TOOLS
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold font-bangla">
                এই ট্যাগের সম্পর্কিত টুলস
              </h2>
            </div>
            <Link to={`/tools/${matchedCat}`} className="text-sm font-semibold text-primary hover:underline">
              সব দেখুন →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedTools.slice(0, 6).map((t) => (
              <Link
                key={t.slug}
                to={`/tools/${t.category}/${t.slug}`}
                className="card-premium p-5 group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} text-white grid place-items-center font-bold`}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 font-bangla">{t.benefit}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{t.price}</span>
                  {t.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {t.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default Tag;
