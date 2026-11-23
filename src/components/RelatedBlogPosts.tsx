/**
 * RelatedBlogPosts
 * ----------------
 * Drop-in section for WP page templates (/guides, /tutorials, /reviews,
 * /resources) that surfaces blog posts whose WordPress category names match
 * a set of keyword hints derived from the page variant. This helps visitors
 * discover deeper reading without leaving the funnel.
 *
 * Picks up to `count` posts. Falls back to most-recent posts when no
 * keyword match is found, so the section is never empty when posts exist.
 */
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { usePosts, usePostCategories, type PostWithCategories, type PostCategory } from "@/lib/cms";
import type { TemplateVariant } from "@/pages/wp/pageTemplates";
import { sanitizeTitle } from "@/lib/sanitize";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

/** Keyword hints per template variant — matched against WP category names. */
const VARIANT_KEYWORDS: Partial<Record<TemplateVariant, string[]>> = {
  guide:     ["guide", "beginner", "গাইড", "শুরু", "affiliate"],
  tutorial:  ["tutorial", "টিউটোরিয়াল", "step", "how", "setup"],
  reviews:   ["review", "রিভিউ", "comparison", "vs", "compare", "best"],
  resources: ["resource", "tool", "টুল", "download", "checklist", "template"],
};

const norm = (s: string) => s.toLowerCase();

const RelatedBlogPosts = ({
  variant,
  gradient,
  heading = "সম্পর্কিত ব্লগ পোস্ট",
  subheading = "আরও গভীরে যেতে এই আর্টিকেলগুলো পড়ুন",
  count = 3,
}: {
  variant: TemplateVariant;
  gradient: string;
  heading?: string;
  subheading?: string;
  count?: number;
}) => {
  const { data: posts = [] } = usePosts();
  const { data: wpCategories = [] } = usePostCategories();

  if (!posts.length) return null;

  const hints = VARIANT_KEYWORDS[variant] ?? [];
  const matchingCatIds = new Set<number>(
    wpCategories
      .filter((c: PostCategory) =>
        hints.some((h) => norm(c.name).includes(norm(h)) || norm(c.slug).includes(norm(h))),
      )
      .map((c) => c.id),
  );

  const score = (p: PostWithCategories) => {
    const ids = p.categoryIds ?? [];
    const overlap = ids.filter((id) => matchingCatIds.has(id)).length;
    if (overlap > 0) return overlap * 10;
    // soft fallback — match against the seed `category` field too
    const cat = norm(p.category ?? "");
    return hints.some((h) => cat.includes(norm(h))) ? 1 : 0;
  };

  const ranked = [...(posts as PostWithCategories[])]
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || (a.p.date < b.p.date ? 1 : -1))
    .map((x) => x.p);

  const picks = ranked.slice(0, count);
  const catById = new Map(wpCategories.map((c) => [c.id, c] as const));

  return (
    <section className="container-app py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 backdrop-blur border border-border text-[11px] font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="h-3.5 w-3.5" /> Read next
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">{heading}</h2>
          <p className="text-sm text-muted-foreground mt-1.5">{subheading}</p>
        </div>
        <Link
          to="/blog"
          className="text-sm font-semibold inline-flex items-center gap-1.5 text-primary hover:gap-2 transition-all"
        >
          সব পোস্ট <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {picks.map((p) => {
          const cardCats = (p.categoryIds ?? [])
            .map((id) => catById.get(id))
            .filter(Boolean)
            .slice(0, 2);
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
                  <span className="text-xs text-muted-foreground">· {p.readTime}</span>
                </div>
                <Link to={`/${p.slug}`} className="block">
                  <h3
                    className="font-bold text-lg leading-snug font-bangla group-hover:text-primary transition-colors"
                    dangerouslySetInnerHTML={{ __html: sanitizeTitle(p.title) }}
                  />
                </Link>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 font-bangla">{p.excerpt}</p>
                <Link
                  to={`/${p.slug}`}
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all`}
                >
                  Read more <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedBlogPosts;
