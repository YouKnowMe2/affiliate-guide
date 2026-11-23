import { Star, ShieldCheck, ThumbsUp, Award } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent, GlassButton } from "./_shared";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { sanitizeTitle } from "@/lib/sanitize";

const stats = [
  { icon: Star,        v: "৪.৮/৫",  l: "গড় রেটিং" },
  { icon: ShieldCheck, v: "১০০%",   l: "নিরপেক্ষ রিভিউ" },
  { icon: ThumbsUp,    v: "১২+",    l: "প্রোগ্রাম কভার" },
  { icon: Award,       v: "২০২৬",   l: "আপডেটেড" },
];

const ReviewsLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
          <div className="max-w-2xl">
            <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Honest review" />
            <h1
              className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
              dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
            />
            {page.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8">{page.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
              <GlassButton to="/tools">Top Picks</GlassButton>
            </div>
          </div>

          {/* Rating card */}
          <div className={`rounded-3xl p-6 bg-gradient-to-br ${template.gradient} text-white shadow-premium-glow w-64`}>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="text-3xl font-display font-bold">৪.৮ / ৫</p>
            <p className="text-sm opacity-90 mt-1">নিরপেক্ষ এডিটোরিয়াল স্কোর</p>
          </div>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="container-app pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-5">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="font-display text-2xl font-bold">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Methodology + content */}
    <section className="container-app py-12">
      <div className="grid lg:grid-cols-[1fr_300px] gap-12">
        <ProseContent html={page.content} template={template} currentSlug={page.slug} />
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">আমরা কীভাবে রেট করি</p>
              <ul className="space-y-3 text-sm">
                {[
                  ["মূল্য", "Pricing & value"],
                  ["সাপোর্ট", "Customer support"],
                  ["পেআউট", "Commission & payout"],
                  ["বিশ্বস্ততা", "Reputation & trust"],
                ].map(([bn, en]) => (
                  <li key={bn} className="flex justify-between"><span>{bn}</span><span className="text-muted-foreground text-xs">{en}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <RelatedBlogPosts
      variant={template.variant}
      gradient={template.gradient}
      heading="সম্পর্কিত রিভিউ ও কম্পেয়ারিজন"
      subheading="বাছাইয়ের আগে এই আর্টিকেলগুলোও পড়ে নিন"
    />

    <CTASection template={template} />
  </main>
);
export default ReviewsLayout;
