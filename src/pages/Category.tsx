import { Link, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePostCategory } from "@/lib/cms";
import SEO from "@/components/SEO";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = usePostCategory(slug);

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
        <h1 className="font-display text-3xl font-bold mb-4">ক্যাটাগরি পাওয়া যায়নি</h1>
        <Button asChild variant="cta">
          <Link to="/categories"><ArrowLeft className="h-4 w-4" /> সব ক্যাটাগরি</Link>
        </Button>
      </section>
    );
  }

  const { item, posts } = data;
  const [featured, ...rest] = posts;

  return (
    <>
      <SEO
        title={item.seo?.title ?? `${stripHtml(item.name)} — Affiliate Guidance`}
        description={item.seo?.description ?? (stripHtml(item.description) || `${stripHtml(item.name)} ক্যাটাগরির সব পোস্ট এক জায়গায়। মোট ${posts.length} টি গাইড ও আর্টিকেল।`)}
        keywords={item.seo?.keywords}
        canonical={item.seo?.canonical ?? `/category/${encodeURIComponent(item.slug)}`}
        robots={item.seo?.robots}
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-20">
          <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> সব ক্যাটাগরি
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <BookOpen className="h-3.5 w-3.5" /> CATEGORY · {posts.length} পোস্ট
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight font-bangla">
            {stripHtml(item.name)}
          </h1>
          {item.description && (
            <p className="mt-4 text-muted-foreground max-w-2xl font-bangla">
              {stripHtml(item.description)}
            </p>
          )}
        </div>
      </section>

      <section className="container-app pb-20">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            এই ক্যাটাগরিতে এখনও কোনো পোস্ট নেই।
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
    </>
  );
};

export default Category;
