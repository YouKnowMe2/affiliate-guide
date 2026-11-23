import { Link } from "react-router-dom";
import { Server, Mail, BarChart3, ShoppingCart, ArrowRight } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent } from "./_shared";
import { sanitizeTitle } from "@/lib/sanitize";

const cats = [
  { icon: Server,       label: "Hosting",   to: "/tools/hosting",  bn: "হোস্টিং" },
  { icon: Mail,         label: "Email",     to: "/tools/email",    bn: "ইমেইল" },
  { icon: BarChart3,    label: "SEO",       to: "/tools/seo",      bn: "SEO" },
  { icon: ShoppingCart, label: "Affiliate", to: "/tools",          bn: "অ্যাফিলিয়েট" },
];

const ToolsLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24">
        <div className="max-w-3xl">
          <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Curated stack" />
          <h1
            className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
          />
          {page.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">{page.excerpt}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
          </div>
        </div>
      </div>
    </section>

    {/* Category grid */}
    <section className="container-app pb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cats.map((c) => (
          <Link key={c.label} to={c.to} className="group relative rounded-2xl bg-card border border-border p-6 hover:border-primary transition overflow-hidden">
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${template.gradient} opacity-10 group-hover:opacity-25 transition`} aria-hidden />
            <c.icon className="h-6 w-6 text-primary mb-3 relative" />
            <p className="font-display text-lg font-semibold relative">{c.bn}</p>
            <p className="text-xs text-muted-foreground mb-3 relative">{c.label}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary relative">
              দেখুন <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>

    {/* Content */}
    <section className="container-app py-8 md:py-12">
      <div className="grid lg:grid-cols-[1fr_280px] gap-12">
        <ProseContent html={page.content} template={template} currentSlug={page.slug} />
        <aside className="hidden lg:block">
          <div className={`sticky top-28 rounded-2xl p-6 bg-gradient-to-br ${template.gradient} text-white shadow-premium-md`}>
            <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Top Pick</p>
            <p className="font-display text-2xl font-bold mb-3">সেরা টুলস স্টাক</p>
            <p className="text-sm opacity-90 mb-4">আমরা ১২+ টুল হাতে পরীক্ষা করেছি। আপনার বাজেট অনুযায়ী বেছে নিন।</p>
            <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold border-b border-white/40 hover:border-white">
              সব টুলস →
            </Link>
          </div>
        </aside>
      </div>
    </section>

    <CTASection template={template} />
  </main>
);
export default ToolsLayout;
