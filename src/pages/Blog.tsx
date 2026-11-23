import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosts, usePostCategories, usePostTags, type PostWithCategories } from "@/lib/cms";
import SEO from "@/components/SEO";
import { sanitizeTitle } from "@/lib/sanitize";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagSlug = searchParams.get("tag") ?? "";
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data: posts = [], isLoading: postsLoading } = usePosts();
  const { data: wpCategories = [], isLoading: catsLoading } = usePostCategories();
  const { data: wpTags = [] } = usePostTags();

  // Lookup so cards can show real WordPress category names + link to /category/:slug
  const catById = useMemo(() => {
    const m = new Map<number, (typeof wpCategories)[number]>();
    wpCategories.forEach((c) => m.set(c.id, c));
    return m;
  }, [wpCategories]);
  const catsForPost = (p: PostWithCategories) =>
    (p.categoryIds ?? []).map((id) => catById.get(id)).filter(Boolean).slice(0, 2);

  // Build map of slug → id for filtering
  const activeCategoryId = useMemo(() => {
    if (categorySlug === "all") return null;
    return wpCategories.find((c) => c.slug === categorySlug)?.id ?? null;
  }, [categorySlug, wpCategories]);

  const activeTag = useMemo(
    () => (tagSlug ? wpTags.find((t) => t.slug === tagSlug || t.rawSlug === tagSlug) ?? null : null),
    [tagSlug, wpTags],
  );

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQ = q === "" || stripHtml(p.title).toLowerCase().includes(q.toLowerCase());
      const matchesCat =
        activeCategoryId == null ||
        ((p as PostWithCategories).categoryIds ?? []).includes(activeCategoryId);
      const matchesTag =
        !activeTag || ((p as PostWithCategories).tagIds ?? []).includes(activeTag.id);
      return matchesQ && matchesCat && matchesTag;
    });
  }, [posts, q, activeCategoryId, activeTag]);

  const clearTag = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    setSearchParams(next, { replace: true });
  };

  const [featured, ...rest] = filtered.length ? filtered : posts;
  const visibleCategories = wpCategories.filter((c) => c.count > 0);

  return (
    <>
      <SEO
        title="Blog — Affiliate Marketing Insights ও গাইড"
        description="Beginner থেকে advanced — affiliate marketing-এর সব topic বাংলায়। SEO, hosting, email marketing, case study ও আরও।"
        canonical="/blog"
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            BLOG
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            Affiliate <span className="gradient-text">Insights</span> ও গাইড
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto font-bangla">
            Beginner থেকে advanced — affiliate marketing-এর সব topic বাংলায়।
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="blog-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles..."
              aria-label="Search articles"
              className="w-full h-12 pl-11 pr-4 rounded-xl glass border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
      </section>

      <section className="container-app pb-20">
        {/* Real WordPress categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" /> Categories
          </div>
          {catsLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategorySlug("all")}
                className={`px-4 h-9 rounded-full text-sm font-semibold transition-all ${
                  categorySlug === "all"
                    ? "bg-gradient-primary text-primary-foreground shadow-premium-glow"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({posts.length})
              </button>
              {visibleCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategorySlug(c.slug)}
                  className={`px-4 h-9 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-1.5 ${
                    categorySlug === c.slug
                      ? "bg-gradient-primary text-primary-foreground shadow-premium-glow"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.name}
                  <span className="text-xs opacity-70">({c.count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTag && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-semibold">
            <Tag className="h-3.5 w-3.5" />
            <span>Tag: {activeTag.name}</span>
            <button
              onClick={clearTag}
              aria-label="Clear tag filter"
              className="ml-1 rounded-full hover:bg-accent/20 p-0.5 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}


        {postsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-premium overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-bangla">
            <p className="text-lg">কোনো পোস্ট পাওয়া যায়নি।</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQ("");
                setCategorySlug("all");
                clearTag();
              }}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <>
            {featured && (
              <Link
                to={`/${featured.slug}`}
                className="card-premium overflow-hidden grid md:grid-cols-2 mb-10 group"
              >
                <div className="aspect-video md:aspect-auto overflow-hidden bg-secondary">
                  <img
                    src={featured.image}
                    alt={stripHtml(featured.title)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs mb-4 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      FEATURED · {featured.contentType}
                    </span>
                    {catsForPost(featured as PostWithCategories).map((c) => (
                      <span
                        key={`fc-${c!.id}`}
                        className="px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold"
                      >
                        {c!.name}
                      </span>
                    ))}
                  </div>
                  <h2
                    className="font-display text-2xl md:text-3xl font-bold leading-tight font-bangla group-hover:text-primary transition-colors"
                    dangerouslySetInnerHTML={{ __html: sanitizeTitle(featured.title) }}
                  />
                  <p className="mt-3 text-muted-foreground font-bangla">{featured.excerpt}</p>
                  <div className="mt-5 text-xs text-muted-foreground flex items-center gap-3">
                    <span>{featured.author}</span> · <span>{featured.date}</span> · <span>{featured.readTime}</span>
                  </div>
                  <Button variant="cta" className="mt-6 self-start" aria-label={`Read the full guide: ${stripHtml(featured.title)}`}>
                    Read the full guide <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((p) => {
                const pc = catsForPost(p as PostWithCategories);
                return (
                <Link key={p.slug} to={`/${p.slug}`} className="card-premium overflow-hidden group">
                  <div className="aspect-[16/10] overflow-hidden bg-secondary">
                    <img
                      src={p.image}
                      alt={stripHtml(p.title)}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                      {pc.length > 0 ? (
                        pc.map((c) => (
                          <span
                            key={`gc-${p.slug}-${c!.id}`}
                            className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold"
                          >
                            {c!.name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                          {p.contentType}
                        </span>
                      )}
                      <span>·</span>
                      <span>{p.readTime}</span>
                    </div>
                    <h3
                      className="font-bold text-lg leading-snug font-bangla group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: sanitizeTitle(p.title) }}
                    />
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 font-bangla">{p.excerpt}</p>
                    <div className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      <span className="sr-only">Read the full article: {stripHtml(p.title)} — </span>Read the full article <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Blog;
