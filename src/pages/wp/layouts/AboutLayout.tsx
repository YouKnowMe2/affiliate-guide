import { Heart, Users, Trophy, Lightbulb } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, GradientButton, ProseContent } from "./_shared";
import { sanitizeTitle } from "@/lib/sanitize";

const values = [
  { icon: Heart,     t: "সততা",         d: "শুধু পরীক্ষিত টুল রিকমেন্ড" },
  { icon: Users,     t: "কমিউনিটি",     d: "বাংলা ক্রিয়েটরদের পাশে" },
  { icon: Trophy,    t: "ফলাফল",        d: "প্রমাণযোগ্য রেজাল্ট ফোকাস" },
  { icon: Lightbulb, t: "শিক্ষা",        d: "ফ্রি ও স্বচ্ছ গাইড" },
];

const AboutLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Our story" />
            <h1
              className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1]"
              dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
            />
            {page.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8">{page.excerpt}</p>
            )}
            <GradientButton to={template.cta.to} gradient={template.gradient}>{template.cta.label}</GradientButton>
          </div>

          {/* Decorative card stack */}
          <div className="relative h-72 md:h-96">
            <div className={`absolute inset-4 rounded-3xl bg-gradient-to-br ${template.gradient} opacity-30 rotate-3`} />
            <div className={`absolute inset-2 rounded-3xl bg-gradient-to-br ${template.gradient} opacity-60 -rotate-2`} />
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${template.gradient} text-white p-8 flex flex-col justify-end shadow-premium-glow`}>
              <p className="text-5xl font-display font-bold mb-2">২০২৪+</p>
              <p className="opacity-90">বাংলায় অ্যাফিলিয়েট রিসোর্স</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="container-app py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {values.map((v) => (
          <div key={v.t} className="rounded-2xl bg-card border border-border p-6">
            <v.icon className="h-6 w-6 text-primary mb-3" />
            <p className="font-display text-lg font-semibold">{v.t}</p>
            <p className="text-sm text-muted-foreground mt-1">{v.d}</p>
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

    <CTASection template={template} />
  </main>
);
export default AboutLayout;
