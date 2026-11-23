import { Mail, MessageCircle, Twitter, Send } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { CTASection, EyebrowChip, ProseContent, SmartCTA } from "./_shared";
import ContactForm from "@/components/ContactForm";
import { sanitizeTitle } from "@/lib/sanitize";

const channels = [
  { icon: Mail,          t: "ইমেইল",     d: "info@affiliateguidance.com", to: "mailto:info@affiliateguidance.com" },
  { icon: MessageCircle, t: "WhatsApp",  d: "দ্রুত উত্তরের জন্য",          to: "https://wa.me/" },
  { icon: Twitter,       t: "X/Twitter", d: "@affiliateguide",            to: "https://twitter.com/" },
  { icon: Send,          t: "Telegram",  d: "কমিউনিটি গ্রুপ",             to: "https://t.me/" },
];

const ContactLayout = ({ page, template }: LayoutProps) => (
  <main>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-10`} aria-hidden />
      <div className="container-app relative py-16 md:py-24 text-center">
        <EyebrowChip icon={template.icon} label={template.eyebrow} badge="Get in touch" />
        <h1
          className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-[1.1] max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
        />
        {page.excerpt && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{page.excerpt}</p>
        )}
      </div>
    </section>

    {/* Channels */}
    <section className="container-app pb-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {channels.map((c) => (
          <SmartCTA
            key={c.t}
            to={c.to}
            className="group rounded-2xl bg-card border border-border p-6 hover:border-primary hover:shadow-premium-md transition"
          >
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${template.gradient} text-white mb-4`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold">{c.t}</p>
            <p className="text-sm text-muted-foreground mt-1 break-all">{c.d}</p>
          </SmartCTA>
        ))}
      </div>
    </section>

    {/* Contact form */}
    <section className="container-app py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">আমাদের লিখুন</h2>
          <p className="text-muted-foreground text-sm">আপনার বার্তা সরাসরি আমাদের ইনবক্সে পৌঁছাবে।</p>
        </div>
        <ContactForm />
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
export default ContactLayout;
