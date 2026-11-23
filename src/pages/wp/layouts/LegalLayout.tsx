import { Link } from "react-router-dom";
import { ShieldCheck, Calendar, FileText } from "lucide-react";
import type { LayoutProps } from "../WPPageTemplate";
import { ProseContent } from "./_shared";
import { sanitizeTitle } from "@/lib/sanitize";

const LegalLayout = ({ page, template }: LayoutProps) => (
  <main className="bg-muted/30">
    <section className="container-app py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 mb-6">
          ← হোম
        </Link>

        <div className="rounded-3xl bg-card border border-border p-8 md:p-12 shadow-premium-md">
          <div className="flex items-center gap-3 mb-6">
            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${template.gradient} text-white`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{template.eyebrow}</p>
              <p className="text-sm font-medium">আইনি নথি</p>
            </div>
          </div>

          <h1
            className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
            dangerouslySetInnerHTML={{ __html: sanitizeTitle(page.title) }}
          />

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            {page.modified && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> আপডেট: {new Date(page.modified).toLocaleDateString("en-GB")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Effective immediately
            </span>
          </div>

          <ProseContent html={page.content} template={template} currentSlug={page.slug} />
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          এই ডকুমেন্ট নিয়ে কোনো প্রশ্ন থাকলে{" "}
          <Link to="/contact" className="text-primary hover:underline">যোগাযোগ করুন</Link>।
        </p>
      </div>
    </section>
  </main>
);
export default LegalLayout;
