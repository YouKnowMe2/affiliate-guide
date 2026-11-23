import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flame,
  Home as HomeIcon,
  List,
  
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HostingPlans from "@/components/affiliate/HostingPlans";
import SeoToolsCTA from "@/components/affiliate/SeoToolsCTA";
import InlineNewsletter from "@/components/affiliate/InlineNewsletter";
import { useNewsletterHydration } from "@/components/affiliate/useNewsletterHydration";
import { useShortcodeHydration } from "@/components/affiliate/useShortcodeHydration";
import { MiniSidebarCloudoora, MiniSidebarRanksuite } from "@/components/affiliate/MiniSidebarWidgets";
import InlineAffiliateWidget from "@/components/affiliate/InlineAffiliateWidget";
import SponsoredCTACard from "@/components/affiliate/SponsoredCTACard";
import {
  usePost,
  usePosts,
  usePostCategories,
  usePostTags,
  type PostWithCategories,
} from "@/lib/cms";
import { categories as seedCategories, getCategory as getSeedCategory } from "@/data/tools";
import { enrichWPContent, type RelatedLink } from "@/lib/enrichWPContent";
import SEO from "@/components/SEO";
import { sanitizeHtml, sanitizeTitle } from "@/lib/sanitize";
import SocialShare from "@/components/SocialShare";
import NotFound from "@/pages/NotFound";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

type TocItem = { id: string; text: string; level: number };

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = usePost(slug);
  const { data: allPosts = [] } = usePosts();
  const { data: wpCategories = [] } = usePostCategories();
  const { data: wpTags = [] } = usePostTags();

  const moneyCat = post?.monetization ? getSeedCategory(post.monetization) : null;

  // Resolve REAL WP categories for this post (used in breadcrumb + chips)
  const postCategories = useMemo(() => {
    const ids = (post as PostWithCategories | undefined)?.categoryIds ?? [];
    if (!ids.length || !wpCategories.length) return [];
    return wpCategories.filter((c) => ids.includes(c.id));
  }, [post, wpCategories]);

  const primaryCategory = postCategories[0] ?? null;

  // Resolve REAL WP tags for this post (used in chips on hero + related cards)
  const postTags = useMemo(() => {
    const ids = (post as PostWithCategories | undefined)?.tagIds ?? [];
    if (!ids.length || !wpTags.length) return [];
    return wpTags.filter((t) => ids.includes(t.id));
  }, [post, wpTags]);

  // Build a fast lookup so related-post chips can render names
  const catById = useMemo(() => {
    const m = new Map<number, (typeof wpCategories)[number]>();
    wpCategories.forEach((c) => m.set(c.id, c));
    return m;
  }, [wpCategories]);
  const tagById = useMemo(() => {
    const m = new Map<number, (typeof wpTags)[number]>();
    wpTags.forEach((t) => m.set(t.id, t));
    return m;
  }, [wpTags]);

  // Reading progress (0–100) — based on article scroll position
  const [readingProgress, setReadingProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const article = document.getElementById("post-article-body");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [post?.slug]);

  /**
   * User-controllable related-post count, persisted per visitor.
   * Choices: 3 / 6 / 9 / 12.
   */
  const [relatedCount, setRelatedCount] = useState<number>(() => {
    if (typeof window === "undefined") return 4;
    const saved = Number(window.localStorage.getItem("ag.relatedCount"));
    return [3, 6, 9, 12].includes(saved) ? saved : 4;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ag.relatedCount", String(relatedCount));
    }
  }, [relatedCount]);

  /**
   * Score-based related posts.
   * Strict preference order (per user requirement):
   *   1) Same WP CATEGORY  (×6 per overlap — strongest signal)
   *   2) Same WP TAG       (×3 per overlap — secondary signal)
   *   3) Same monetization (×2)
   *   4) Same display category (×1)
   *   5) Recency bonus     (+0.5 if within last 90 days)
   * Posts with 0 score still appear at the end so we always have enough to fill
   * the requested count.
   */
  const related = useMemo(() => {
    if (!post) return [];
    const currentCats = new Set((post as PostWithCategories).categoryIds ?? []);
    const currentTags = new Set((post as PostWithCategories).tagIds ?? []);
    const now = Date.now();
    const scored = allPosts
      .filter((p) => p.slug !== post.slug)
      .map((p) => {
        const cats = (p as PostWithCategories).categoryIds ?? [];
        const tags = (p as PostWithCategories).tagIds ?? [];
        const catOverlap = cats.filter((id) => currentCats.has(id)).length;
        const tagOverlap = tags.filter((id) => currentTags.has(id)).length;
        let score = catOverlap * 6 + tagOverlap * 3;
        if (post.monetization && p.monetization === post.monetization) score += 2;
        if (post.category && p.category === post.category) score += 1;
        const t = Date.parse(p.date || "");
        if (!Number.isNaN(t) && now - t < 1000 * 60 * 60 * 24 * 90) score += 0.5;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);
    return scored.slice(0, relatedCount);
  }, [allPosts, post, relatedCount]);

  const enrichedHtml = useMemo(() => {
    if (!post?.content) return "";
    const relatedLinks: RelatedLink[] = related
      .slice(0, 6)
      .map((p) => ({ title: stripHtml(p.title), to: `/${p.slug}` }));
    return enrichWPContent(post.content, {
      template: {
        variant: "default",
        eyebrow: post.category,
        gradient: "from-primary via-primary to-primary/70",
        cta: {
          label: moneyCat ? moneyCat.cta : "Recommended Tools দেখুন",
          to: moneyCat ? `/tools/${moneyCat.slug}` : "/tools",
        },
        icon: "✨",
      },
      related: relatedLinks,
      slug: post.slug,
      title: stripHtml(post.title),
    });
  }, [post?.content, post?.slug, post?.title, post?.category, related, moneyCat]);

  // Build a TOC from rendered headings
  const [toc, setToc] = useState<TocItem[]>([]);
  useEffect(() => {
    if (!enrichedHtml) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = enrichedHtml;
    const heads = Array.from(tmp.querySelectorAll("h2, h3"));
    setToc(
      heads
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: stripHtml(h.innerHTML).slice(0, 80),
          level: h.tagName === "H2" ? 2 : 3,
        })),
    );
  }, [enrichedHtml]);

  // Hydrate inline newsletter mount-points injected by enrichWPContent
  const proseRef = useRef<HTMLDivElement>(null);
  const newsletterPortals = useNewsletterHydration(proseRef, enrichedHtml);
  const shortcodePortals = useShortcodeHydration(proseRef, enrichedHtml);

  // Smart-sticky sidebar: sticks at top:24px when shorter than viewport,
  // otherwise sticks so its bottom aligns with viewport bottom (scrolls with content until end).
  const sidebarRef = useRef<HTMLElement>(null);
  const [sidebarTop, setSidebarTop] = useState<number>(96); // 6rem default
  useEffect(() => {
    const HEADER_OFFSET = 96; // top-24
    const BOTTOM_GAP = 24;
    const compute = () => {
      const el = sidebarRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const sh = el.offsetHeight;
      if (sh + HEADER_OFFSET + BOTTOM_GAP <= vh) {
        setSidebarTop(HEADER_OFFSET);
      } else {
        // negative top so bottom of sidebar aligns near viewport bottom
        setSidebarTop(vh - sh - BOTTOM_GAP);
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (sidebarRef.current) ro.observe(sidebarRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [enrichedHtml]);

  // Random bottom-CTA pick — stable per post; placed BEFORE early return to keep hook order consistent
  const showHeroCta = useMemo(() => Math.random() < 0.5, [post?.slug]);

  if (isLoading) {
    return (
      <div className="container-app py-32 text-center text-muted-foreground font-bangla">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  // Tool ad picks for sidebar (rotates from seed categories)
  const adTools = seedCategories.slice(0, 3);

  return (
    <article id="post-article-body">
      {/* Reading progress bar */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-150 ease-out shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        />
      </div>
      <SEO
        title={post.seo?.title ?? `${stripHtml(post.title)} · Affiliate Guidance`}
        description={post.seo?.description ?? post.excerpt}
        keywords={post.seo?.keywords}
        canonical={post.seo?.canonical ?? `/${post.slug}`}
        image={post.image}
        type="article"
        robots={post.seo?.robots}
        schemaHead={(post.seo as any)?.schemaHead}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: stripHtml(post.title),
          description: post.seo?.description ?? post.excerpt,
          image: post.image ? [post.image] : undefined,
          author: { "@type": "Person", name: post.author },
          datePublished: post.date,
          mainEntityOfPage:
            typeof window !== "undefined"
              ? `${window.location.origin}/${post.slug}`
              : `/${post.slug}`,
        }}
      />

      {/* Hero / breadcrumb */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-10 md:py-14">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5 flex-wrap"
          >
            <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
              <HomeIcon className="h-3.5 w-3.5" /> Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            {primaryCategory && (
              <>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <Link
                  to={`/category/${primaryCategory.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {primaryCategory.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span
              className="text-foreground font-medium truncate max-w-[280px] md:max-w-md"
              title={stripHtml(post.title)}
            >
              {stripHtml(post.title)}
            </span>
          </nav>

          <div className="max-w-4xl">
            {postTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {postTags.slice(0, 8).map((t) => (
                  <Link
                    key={t.id}
                    to={`/blog?tag=${encodeURIComponent(t.slug)}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 text-[11px] font-medium transition-colors"
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            <h1
              className="font-display text-3xl md:text-5xl font-bold leading-tight font-bangla"
              dangerouslySetInnerHTML={{ __html: sanitizeTitle(post.title) }}
            />
            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground font-bangla">{post.excerpt}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {post.readTime}
              </span>
              {(postCategories.length > 0 || post.category) && (
                <span className="flex flex-wrap items-center gap-1.5">
                  {postCategories.length > 0 ? (
                    postCategories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Tag className="h-3 w-3" /> {c.name}
                      </Link>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {post.category}
                    </span>
                  )}
                </span>
              )}
              <div className="ml-auto">
                <SocialShare title={stripHtml(post.title)} compact />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app py-12">
        {post.image && (
          <div className="aspect-[16/8] rounded-3xl overflow-hidden bg-secondary mb-12 max-w-6xl mx-auto">
            <img
              src={post.image}
              alt={stripHtml(post.title)}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main grid: content + sidebar */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12 max-w-6xl mx-auto">
          {/* CONTENT */}
          <div className="min-w-0 font-bangla">
            {post.content ? (
              <article className="wp-prose prose-content text-[17px] leading-[1.85]">
                <div ref={proseRef} dangerouslySetInnerHTML={{ __html: sanitizeHtml(enrichedHtml) }} />
                {newsletterPortals}
                {shortcodePortals}
              </article>
            ) : (
              <div className="prose-content text-[17px] leading-[1.85]">
                <p>{post.excerpt}</p>
                <p className="text-muted-foreground mt-6">
                  এই পোস্টের পূর্ণ কনটেন্ট শীঘ্রই যোগ করা হবে।
                </p>
              </div>
            )}



            {/* Random bottom CTA: only one of the two callouts shown per visit */}
            {(() => {
              return showHeroCta ? (
                <div className="mt-10 not-prose p-8 rounded-2xl bg-gradient-hero text-white text-center">
                  <h3 className="font-display text-2xl font-bold mb-2">Ready to Start?</h3>
                  <p className="text-white/85 mb-5 font-bangla">
                    {moneyCat
                      ? `${moneyCat.title} নিয়ে এখনই আপনার journey শুরু করুন।`
                      : "আমাদের recommended tools দিয়ে আজই আপনার journey শুরু করুন।"}
                  </p>
                  <Button
                    variant="hero-outline"
                    size="lg"
                    asChild
                    className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-foreground"
                  >
                    <Link to={moneyCat ? `/tools/${moneyCat.slug}` : "/tools"}>
                      {moneyCat?.cta ?? "Best Tools দেখুন"} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <aside className="not-prose mt-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-3xl leading-none shrink-0">📩</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                        Free Affiliate Guide
                      </p>
                      <p className="font-bangla text-base font-semibold leading-snug">
                        PDF roadmap পান — কোথা থেকে শুরু, কী tools, কীভাবে স্কেল।
                      </p>
                    </div>
                    <Button
                      variant="cta"
                      size="sm"
                      className="shrink-0 self-stretch sm:self-auto"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("ag:open-lead-modal", { detail: { source: "mid-article-cta" } }));
                      }}
                    >
                      Free Download <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </aside>
              );
            })()}
          </div>

          {/* SIDEBAR — smart sticky: scrolls with content until its bottom hits viewport, then sticks */}
          <aside
            ref={sidebarRef}
            style={{ top: sidebarTop }}
            className="space-y-10 lg:sticky lg:self-start lg:pr-1"
          >
            {/* Minimal sidebar newsletter — single email field, works inline */}
            <InlineNewsletter
              variant="compact"
              source="sidebar-newsletter"
              postSlug={post.slug}
              postTitle={stripHtml(post.title)}
              className="!my-0 mx-0"
            />

            {/* Table of Contents */}
            {toc.length > 1 && (
              <details className="card-premium p-5 group [&_svg.toc-chevron]:open:rotate-180">
                <summary className="flex items-center justify-between gap-2 cursor-pointer list-none select-none">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                      Table of Contents
                    </h4>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {toc.length}
                    </span>
                  </div>
                  <ChevronDown className="toc-chevron h-4 w-4 text-muted-foreground transition-transform" />
                </summary>
                <nav className="text-sm space-y-1.5 mt-4">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block hover:text-primary transition-colors leading-snug ${
                        item.level === 3
                          ? "pl-4 text-xs text-muted-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            {/* Sponsored / Tool Ad */}
            {adTools[0] && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground p-6 shadow-premium-glow">
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider opacity-70">
                  Sponsored
                </span>
                <div className="text-3xl mb-3">{adTools[0].icon}</div>
                <h4 className="font-display text-lg font-bold leading-tight">
                  {adTools[0].banglaTitle}
                </h4>
                <p className="text-sm opacity-90 mt-2 font-bangla">{adTools[0].hook}</p>
                <Button
                  variant="hero-outline"
                  size="sm"
                  asChild
                  className="mt-4 w-full bg-white/15 text-white border-white/40 hover:bg-white hover:text-foreground"
                >
                  <Link to={`/tools/${adTools[0].slug}`}>
                    {adTools[0].cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Resource Download — free PDF/checklist lead magnet */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-5 mx-0 my-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-accent font-bold mb-0.5">
                    Free Resource
                  </p>
                  <h4 className="font-display text-sm font-bold leading-tight font-bangla">
                    Affiliate Starter Kit (PDF)
                  </h4>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-bangla mb-3 leading-relaxed">
                Niche checklist, tools list ও first-sale roadmap — সব এক PDF-এ।
              </p>
              <Button
                variant="cta"
                size="sm"
                className="w-full"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("ag:open-lead-modal", {
                      detail: { source: "sidebar-resource-download" },
                    }),
                  );
                }}
              >
                <Download className="h-3.5 w-3.5" /> Free Download
              </Button>
            </div>

            {/* Minimal partner mini-widget — only the family matching this post's
                primary monetization, so we never duplicate a partner site/category
                across sidebar + bottom in-content CTAs. */}
            {(post.monetization === "seo" || post.monetization === "keyword")
              ? <MiniSidebarRanksuite />
              : <MiniSidebarCloudoora />}

            {/* Sponsored content CTA → routes to /sponsored */}
            <SponsoredCTACard />

            {/* Related & Trending — concise list */}
            {related.length > 0 && (
              <div className="card-premium p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-accent" />
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                    Related & Trending
                  </h4>
                </div>
                <ul className="divide-y divide-border/50">
                  {related.slice(0, 5).map((p, i) => (
                    <li key={p.slug}>
                      <Link
                        to={`/${p.slug}`}
                        className="flex items-center gap-2.5 py-2 group"
                      >
                        <span className="text-[11px] font-bold text-primary/50 w-4 shrink-0 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h5
                          className="text-[13px] font-medium leading-snug font-bangla group-hover:text-primary transition-colors line-clamp-2 flex-1 min-w-0"
                          dangerouslySetInnerHTML={{ __html: sanitizeTitle(p.title) }}
                        />
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </aside>
        </div>

        {/* In-content affiliate blocks placed BEFORE the Related heading.
            1) The full Hosting/SEO partner block (always shown — moved out of the sidebar).
            2) A randomized smaller widget (Cloudoora or RankSuite) chosen by
               post slug + tags + category for variety across the blog. */}
        <div className="max-w-4xl mx-auto mt-12 space-y-6">
          {(() => {
            const isSeoPrimary = post.monetization === "seo" || post.monetization === "keyword";
            // Primary block determines which partner-site family is "used".
            // The secondary widget MUST come from the other family, so we never
            // show two CTAs from the same site/category back-to-back.
            const primaryFamily = isSeoPrimary ? "ranksuite" : "cloudoora";
            return (
              <>
                {isSeoPrimary ? <SeoToolsCTA variant="inline" /> : <HostingPlans variant="inline" />}
                <InlineAffiliateWidget
                  slug={post.slug}
                  category={post.category}
                  tags={(post as PostWithCategories).tagIds?.map((id) => tagById.get(id)?.slug ?? "").filter(Boolean) ?? []}
                  monetization={post.monetization ?? null}
                  excludeFamily={primaryFamily}
                />
              </>
            );
          })()}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-16 max-w-6xl mx-auto">
            <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">আরও পড়ুন</h2>
                <p className="text-sm text-muted-foreground mt-1 font-bangla">
                  Same category &gt; same tag &gt; related — আপনার জন্য বাছাই করা।
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <label className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Show</span>
                  <select
                    value={relatedCount}
                    onChange={(e) => setRelatedCount(Number(e.target.value))}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Number of related posts"
                  >
                    {[3, 6, 9, 12].map((n) => (
                      <option key={n} value={n}>
                        {n} posts
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 leading-tight">
                  <Sparkles className="h-3 w-3 text-primary/70 shrink-0" />
                  <span>
                    Ranked by{" "}
                    <strong className="text-foreground/80 font-semibold">category first</strong>, then{" "}
                    <strong className="text-foreground/80 font-semibold">tag</strong>
                  </span>
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => {
                const cardCats = ((p as PostWithCategories).categoryIds ?? [])
                  .map((id) => catById.get(id))
                  .filter(Boolean)
                  .slice(0, 2);
                const cardTags = ((p as PostWithCategories).tagIds ?? [])
                  .map((id) => tagById.get(id))
                  .filter(Boolean)
                  .slice(0, 3);
                return (
                  <div key={p.slug} className="card-premium overflow-hidden group flex flex-col">
                    <Link to={`/${p.slug}`} className="block aspect-[16/10] overflow-hidden bg-secondary">
                      <img
                        src={p.image}
                        alt={stripHtml(p.title)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {cardCats.length > 0 ? (
                          cardCats.map((c) => (
                            <Link
                              key={`c-${c!.id}`}
                              to={`/category/${c!.slug}`}
                              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                            >
                              {c!.name}
                            </Link>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <Link to={`/${p.slug}`} className="block">
                        <h3
                          className="font-bold text-lg leading-snug font-bangla group-hover:text-primary transition-colors"
                          dangerouslySetInnerHTML={{ __html: sanitizeTitle(p.title) }}
                        />
                      </Link>
                      {cardTags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {cardTags.map((t) => (
                            <Link
                              key={`t-${t!.id}`}
                              to={`/blog?tag=${encodeURIComponent(t!.slug)}`}
                              className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 text-[11px] font-medium transition-colors"
                            >
                              #{t!.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
