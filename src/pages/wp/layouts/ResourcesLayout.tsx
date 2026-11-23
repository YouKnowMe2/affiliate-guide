import { Download, FileText, ListChecks, Wrench } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent } from "./_shared";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import { sanitizeTitle } from "@/lib/sanitize";

const kits = [
  { icon: ListChecks, label: "চেকলিস্ট", desc: "লঞ্চ, কনটেন্ট, SEO" },
  { icon: FileText,   label: "টেমপ্লেট", desc: "রিভিউ, ইমেইল, ল্যান্ডিং" },
  { icon: Wrench,     label: "টুলকিট",   desc: "টপ পিকস, ফ্রি অপশন" },
  { icon: Download,   label: "ডাউনলোড",  desc: "PDF, Sheets, Notion" },
];

const ResourcesLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-gradient-to-br ${template.gradient} opacity-20 blur-3xl`} aria-hidden />
      <div className="container-app relative py-16 md:py-24 text-center">
        <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Free toolkit" />
        <h1
          className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1] max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
        />
        {page.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{page.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
        </div>
      </div>
    </section>

    {/* Kit cards */}
    <section className="container-app pb-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kits.map((k) => (
          <div key={k.label} className="group rounded-2xl bg-card border border-border p-6 hover:shadow-premium-md transition">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${template.gradient} text-white mb-4`}>
              <k.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold">{k.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{k.desc}</p>
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
      heading="সম্পর্কিত রিসোর্স ও গাইড"
      subheading="এই টুলকিটের সাথে কাজে লাগবে এমন আর্টিকেল"
    />

    <CTASection template={template} />
  </main>
);
export default ResourcesLayout;
