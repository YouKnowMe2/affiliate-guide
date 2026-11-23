import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent, GlassButton } from "./_shared";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { sanitizeTitle } from "@/lib/sanitize";

const steps = [
  { n: "01", t: "ভিত্তি বুঝুন",        d: "অ্যাফিলিয়েট মডেল ও টার্ম" },
  { n: "02", t: "নিশ ফাইনাল করুন",     d: "চাহিদা + আগ্রহের ক্রস" },
  { n: "03", t: "সাইট সেটআপ",          d: "হোস্টিং, ডোমেইন, থিম" },
  { n: "04", t: "কনটেন্ট প্ল্যান",       d: "টপিক ক্লাস্টার, কীওয়ার্ড" },
  { n: "05", t: "ট্রাফিক বিল্ড",         d: "SEO, সোশ্যাল, ইমেইল" },
  { n: "06", t: "অপ্টিমাইজ + স্কেল",     d: "কনভার্সন, A/B, রিইনভেস্ট" },
];

const TutorialLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24">
        <div className="max-w-3xl">
          <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Step-by-step" />
          <h1
            className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
          />
          {page.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8">{page.excerpt}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
            <GlassButton to="/guides">গাইডস</GlassButton>
          </div>
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="container-app py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-2xl bg-card border border-border p-6 overflow-hidden">
            <span className={`absolute -top-3 -right-3 font-display text-6xl font-bold opacity-10 bg-gradient-to-br ${template.gradient} bg-clip-text text-transparent`}>
              {s.n}
            </span>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Step {s.n}</p>
            <p className="font-display text-xl font-semibold mb-1">{s.t}</p>
            <p className="text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Content */}
    <section className="container-app py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <ProseContent html={page.content} template={template} currentSlug={page.slug} />
      </div>
    </section>

    <RelatedBlogPosts
      variant={template.variant}
      gradient={template.gradient}
      heading="সম্পর্কিত টিউটোরিয়াল"
      subheading="স্টেপ-বাই-স্টেপ শিখতে এই পোস্টগুলো দেখুন"
    />

    <CTASection template={template} />
  </main>
);
export default TutorialLayout;
