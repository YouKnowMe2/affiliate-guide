import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent } from "./_shared";
import { sanitizeTitle } from "@/lib/sanitize";

const DefaultLayout = ({ page, template }: LayoutProps) => (
  <main>
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24">
        <div className="max-w-3xl">
          <EyebrowChip icon={template.icon} label={template.eyebrow} />
          <h1
            className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
            dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
          />
          {page.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground mb-8">{page.excerpt}</p>
          )}
          <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
        </div>
      </div>
    </section>

    <section className="container-app py-12">
      <div className="max-w-3xl mx-auto">
        <ProseContent html={page.content} template={template} currentSlug={page.slug} />
      </div>
    </section>

    <CTASection template={template} />
  </main>
);
export default DefaultLayout;
