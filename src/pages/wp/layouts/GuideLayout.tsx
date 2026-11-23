import { Link } from "react-router-dom";
import {
  BookOpen, CheckCircle2, Clock, Compass, Sparkles, Target, TrendingUp,
} from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent, GlassButton } from "./_shared";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { sanitizeTitle } from "@/lib/sanitize";

const milestones = [
  { icon: Compass, label: "ভিত্তি", desc: "বেসিক টার্ম, কোন নিশ বেছে নেবেন" },
  { icon: Target,  label: "প্রস্তুতি", desc: "ব্লগ/সাইট সেটআপ, ট্র্যাকিং" },
  { icon: TrendingUp, label: "গ্রোথ", desc: "ট্রাফিক, কনভার্সন, স্কেল" },
];

const GuideLayout = ({ page, template }: LayoutProps) => {
  const readMins = Math.max(3, Math.round(page.content.replace(/<[^>]+>/g, "").split(/\s+/).length / 180));

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
        <div className={`absolute -top-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br ${template.gradient} opacity-25 blur-3xl`} aria-hidden />
        <div className="container-app relative py-16 md:py-24">
          <div className="max-w-3xl">
            <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Pillar guide" />
            <h1
              className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
              dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
            />
            {page.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">{page.excerpt}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{readMins} মিনিট পড়া</span>
              <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" />Beginner → Advanced</span>
              {page.modified && (
                <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4" />আপডেট: {new Date(page.modified).toLocaleDateString("en-GB")}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
              <GlassButton to="/guides">সব গাইডস</GlassButton>
            </div>
          </div>
        </div>
      </section>

      {/* Learning roadmap */}
      <section className="container-app pt-4 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {milestones.map((m, i) => (
            <div key={m.label} className="relative rounded-2xl bg-card border border-border p-6">
              <div className={`absolute -top-3 left-6 inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br ${template.gradient} text-white text-xs font-bold`}>
                {i + 1}
              </div>
              <m.icon className="h-6 w-6 text-primary mb-3" />
              <p className="font-display text-lg font-semibold mb-1">{m.label}</p>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content + sticky aside */}
      <section className="container-app py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          <ProseContent html={page.content} template={template} currentSlug={page.slug} />
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className={`rounded-2xl p-6 bg-gradient-to-br ${template.gradient} text-white shadow-premium-md`}>
                <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Next step</p>
                <p className="font-display text-xl font-semibold mb-4 leading-tight">{template.cta.label}</p>
                <Link to={template.cta.to} className="inline-flex items-center gap-1.5 text-sm font-semibold border-b border-white/40 hover:border-white">
                  এখনই শুরু →
                </Link>
              </div>
              <div className="rounded-2xl p-6 bg-card border border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">এই গাইডে</p>
                <ul className="space-y-2.5 text-sm">
                  {["ভিত্তি ও কনসেপ্ট", "নিশ ও প্রোগ্রাম নির্বাচন", "সাইট ও কনটেন্ট", "ট্রাফিক ও SEO", "মনিটাইজেশন"].map((t) => (
                    <li key={t} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />{t}</li>
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
        heading="সম্পর্কিত গাইড ও ব্লগ পোস্ট"
        subheading="এই গাইডের সাথে মিল রেখে বাছাই করা আর্টিকেল"
      />

      <CTASection template={template} />
    </main>
  );
};
export default GuideLayout;
