import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  ChevronRight,
  Loader2,
  CheckCircle2,
  Send,
  Megaphone,
  TrendingUp,
  Users,
  Mail,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

const Schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().min(2, "Company is required").max(150),
  website: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(255)
    .optional()
    .or(z.literal("")),
  budget: z.string().trim().max(50).optional(),
  goal: z.string().trim().max(80).optional(),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more (20+ chars)")
    .max(2000),
});

type FormState = z.infer<typeof Schema>;

const PACKAGES = [
  {
    icon: Megaphone,
    title: "Sponsored Review",
    desc: "Long-form review post on a relevant blog category, with a contextual do-follow link.",
  },
  {
    icon: TrendingUp,
    title: "Link Insertion",
    desc: "Add a contextual do-follow link inside an existing high-traffic post.",
  },
  {
    icon: Mail,
    title: "Newsletter Shoutout",
    desc: "Featured slot inside our weekly affiliate-tips newsletter to engaged readers.",
  },
  {
    icon: Users,
    title: "Bundled Campaign",
    desc: "Custom bundle: review + newsletter + sidebar widget for sustained exposure.",
  },
];

const Sponsored = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    website: "",
    budget: "",
    goal: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track("sponsored_submit_attempt", {});
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormState;
        fe[k] = i.message;
      });
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "send-submission-email",
        {
          body: {
            type: "sponsored",
            replyTo: parsed.data.email,
            payload: {
              name: parsed.data.name,
              email: parsed.data.email,
              company: parsed.data.company,
              website: parsed.data.website || "",
              budget: parsed.data.budget || "",
              goal: parsed.data.goal || "",
              message: parsed.data.message,
            },
          },
        },
      );
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);

      setDone(true);
      setForm({
        name: "",
        email: "",
        company: "",
        website: "",
        budget: "",
        goal: "",
        message: "",
      });
      toast({ title: "Inquiry sent", description: "We'll get back within 1–2 business days." });
      track("sponsored_submit_success", {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
      track("sponsored_submit_error", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SEO
        title="Sponsored Content & Advertising · Affiliate Guidance"
        description="Promote your hosting, SEO, or affiliate tool to engaged readers. Sponsored reviews, link insertions, newsletter shoutouts."
        canonical="/sponsored"
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-12 md:py-16">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-foreground font-medium">Sponsored</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
              <Megaphone className="h-3 w-3" /> For Brands
            </span>
            <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Sponsor a Post or Place Your Brand
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-bangla">
              আপনার hosting, SEO tool, বা affiliate program কে engaged পাঠকদের সামনে তুলে ধরুন। নিচের ফর্মে details পাঠান — আমরা ১–২ কর্মদিবসের মধ্যে জানাব।
            </p>
          </div>
        </div>
      </header>

      <div className="container-app py-12">
        {/* Packages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
          {PACKAGES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center mb-3">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-base mb-1.5">{p.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12 max-w-5xl mx-auto">
          {/* FORM */}
          <div className="min-w-0">
            {done ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-success/10 grid place-items-center mb-5">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Inquiry sent!</h2>
                <p className="text-muted-foreground font-bangla mb-6">
                  ধন্যবাদ! আমরা ১–২ কর্মদিবসের মধ্যে আপনাকে ইমেইল করব।
                </p>
                <Button variant="outline" onClick={() => setDone(false)}>
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sp-name">Your name *</Label>
                    <Input id="sp-name" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} className="mt-1.5" />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="sp-email">Email *</Label>
                    <Input id="sp-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={255} className="mt-1.5" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sp-company">Company *</Label>
                    <Input id="sp-company" value={form.company} onChange={(e) => set("company", e.target.value)} maxLength={150} className="mt-1.5" />
                    {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
                  </div>
                  <div>
                    <Label htmlFor="sp-website">Website</Label>
                    <Input id="sp-website" type="url" value={form.website} onChange={(e) => set("website", e.target.value)} maxLength={255} className="mt-1.5" placeholder="https://" />
                    {errors.website && <p className="text-xs text-destructive mt-1">{errors.website}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sp-goal">Goal / package</Label>
                    <select
                      id="sp-goal"
                      value={form.goal}
                      onChange={(e) => set("goal", e.target.value)}
                      className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select…</option>
                      <option>Sponsored Review</option>
                      <option>Link Insertion</option>
                      <option>Newsletter Shoutout</option>
                      <option>Bundled Campaign</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sp-budget">Budget (USD)</Label>
                    <select
                      id="sp-budget"
                      value={form.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select…</option>
                      <option>&lt; $200</option>
                      <option>$200 – $500</option>
                      <option>$500 – $1,000</option>
                      <option>$1,000+</option>
                      <option>Let's discuss</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sp-message">Tell us about your offer *</Label>
                  <Textarea
                    id="sp-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    maxLength={2000}
                    className="mt-1.5"
                    placeholder="What product/service are you promoting? Target audience? Any specific posts you'd like to be featured in?"
                  />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send inquiry</>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-3">
                Why sponsor with us?
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Hosting + SEO + affiliate-focused audience",
                  "Bangla & English readership across SEA + Bangladesh",
                  "Long-form, evergreen content (not banner blindness)",
                  "Transparent disclosure & honest editorial approach",
                ].map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">
                Want to publish your own article instead?
              </p>
              <h4 className="font-display text-sm font-bold leading-tight mb-3">
                Submit a free guest post
              </h4>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/guest-post">Write for us</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Sponsored;
