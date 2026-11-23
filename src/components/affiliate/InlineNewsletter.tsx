import { useState } from "react";
import { Mail, Loader2, Check, Send, Sparkles, Gift, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Stricter email validation: requires TLD of 2+ chars, no consecutive dots, reasonable local-part
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

const validateEmail = (raw: string): { ok: true; value: string } | { ok: false; message: string } => {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: false, message: "ইমেইল ঠিকানা দিন।" };
  if (value.length > 254) return { ok: false, message: "ইমেইল অনেক বড় — সংক্ষিপ্ত করুন।" };
  if (value.includes("..")) return { ok: false, message: "ইমেইলে পরপর দুটি dot (..) থাকতে পারবে না।" };
  if (!EMAIL_RE.test(value)) return { ok: false, message: "সঠিক ইমেইল ঠিকানা দিন (যেমন: name@gmail.com)।" };
  return { ok: true, value };
};

export type NewsletterVariant = "default" | "card" | "gradient" | "compact";

type Props = {
  source?: string;
  postSlug?: string;
  postTitle?: string;
  className?: string;
  variant?: NewsletterVariant;
};

const COPY: Record<NewsletterVariant, { eyebrow: string; title: string; sub: string; cta: string; icon: JSX.Element }> = {
  default: {
    eyebrow: "Newsletter",
    title: "সাপ্তাহিক affiliate টিপস ইমেইলে পান",
    sub: "No spam · যেকোনো সময় unsubscribe",
    cta: "Subscribe",
    icon: <Mail className="h-5 w-5" />,
  },
  card: {
    eyebrow: "Free Guide",
    title: "ফ্রি অ্যাফিলিয়েট গাইড + সাপ্তাহিক টিপস",
    sub: "নতুন রিভিউ, টুলস ও কেস-স্টাডি সরাসরি inbox-এ।",
    cta: "Get Free Guide",
    icon: <Gift className="h-5 w-5" />,
  },
  gradient: {
    eyebrow: "Join 5,000+ readers",
    title: "প্রতি সপ্তাহে actionable affiliate playbook",
    sub: "১ ক্লিকে subscribe — কোনো spam নয়।",
    cta: "Join Now",
    icon: <Sparkles className="h-5 w-5" />,
  },
  compact: {
    eyebrow: "",
    title: "সাপ্তাহিক টিপস ইমেইলে পান",
    sub: "Subscribe — free, no spam।",
    cta: "Send",
    icon: <Send className="h-5 w-5" />,
  },
};

const InlineNewsletter = ({
  source = "blog-inline",
  postSlug,
  postTitle,
  className = "",
  variant = "default",
}: Props) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[variant];

  const onChangeEmail = (v: string) => {
    setEmail(v);
    if (error) setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = validateEmail(email);
    if (result.ok === false) {
      const msg = result.message;
      setError(msg);
      if (variant !== "compact") {
        toast({ title: "Invalid email", description: msg, variant: "destructive" });
      }
      return;
    }
    setSubmitting(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: result.value, source: `${source}:${variant}`, postSlug, postTitle },
      });
      if (fnError) throw fnError;
      setDone(true);
      if (variant !== "compact") {
        toast({
          title: "🎉 Subscribed!",
          description: "Inbox চেক করুন — confirmation পাঠানো হয়েছে।",
        });
      }
    } catch (err) {
      console.error(err);
      const msg = "একটু সমস্যা হয়েছে — কিছুক্ষণ পরে আবার চেষ্টা করুন।";
      setError(msg);
      if (variant !== "compact") {
        toast({ title: "Something went wrong", description: msg, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Shared form
  const Form = (
    <form
      onSubmit={onSubmit}
      className="flex w-full md:flex-1 max-w-md items-stretch gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => onChangeEmail(e.target.value)}
        placeholder="email@domain.com"
        maxLength={255}
        disabled={submitting}
        aria-invalid={!!error}
        aria-describedby={error ? "newsletter-error" : undefined}
        className={`flex-1 min-w-0 h-11 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${
          variant === "gradient"
            ? "border-white/30 bg-white/15 text-white placeholder:text-white/70 focus:ring-white"
            : error
              ? "border-destructive bg-background focus:ring-destructive"
              : "border-border bg-background focus:ring-primary"
        }`}
        aria-label="Email address"
      />
      <Button
        type="submit"
        variant={variant === "gradient" ? "secondary" : "cta"}
        size="sm"
        disabled={submitting}
        className={`h-11 px-4 shrink-0 ${variant === "gradient" ? "bg-white text-foreground hover:bg-white/90" : ""}`}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.cta}
      </Button>
    </form>
  );

  const Done = (
    <div
      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl ${
        variant === "gradient"
          ? "bg-white/20 text-white"
          : "text-success bg-success/10"
      }`}
    >
      <Check className="h-4 w-4" /> Subscribed!
    </div>
  );

  // ===== CARD variant — vertical, prominent =====
  if (variant === "card") {
    return (
      <aside
        className={`not-prose my-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-premium-sm ${className}`}
        data-analytics="newsletter-inline"
        data-variant={variant}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
            {copy.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
              {copy.eyebrow}
            </p>
            <p className="font-display text-lg md:text-xl font-bold leading-tight font-bangla">
              {copy.title}
            </p>
            <p className="text-sm text-muted-foreground font-bangla mt-1">{copy.sub}</p>
          </div>
        </div>
        {done ? Done : Form}
      </aside>
    );
  }

  // ===== GRADIENT variant =====
  if (variant === "gradient") {
    return (
      <aside
        className={`not-prose my-8 rounded-2xl p-6 md:p-7 bg-gradient-primary text-primary-foreground shadow-premium-glow ${className}`}
        data-analytics="newsletter-inline"
        data-variant={variant}
      >
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center shrink-0">
              {copy.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider opacity-90 mb-0.5">
                {copy.eyebrow}
              </p>
              <p className="font-display text-base md:text-lg font-bold leading-tight font-bangla">
                {copy.title}
              </p>
              <p className="text-xs opacity-90 font-bangla">{copy.sub}</p>
            </div>
          </div>
          {done ? Done : Form}
        </div>
      </aside>
    );
  }

  // ===== COMPACT variant — vertical, with inline error/success messages =====
  if (variant === "compact") {
    return (
      <aside
        className={`not-prose my-6 rounded-xl border border-border bg-muted/40 p-4 ${className}`}
        data-analytics="newsletter-inline"
        data-variant={variant}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Send className="h-4 w-4 text-primary shrink-0" />
          <p className="font-semibold text-sm font-bangla leading-tight">{copy.title}</p>
        </div>
        {done ? (
          <div className="flex items-start gap-2 text-sm rounded-lg bg-success/10 text-success px-3 py-2.5 font-medium">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-bangla">
              ধন্যবাদ! আপনার inbox চেক করুন — confirmation পাঠানো হয়েছে।
            </span>
          </div>
        ) : (
          <>
            {Form}
            {error ? (
              <p
                id="newsletter-error"
                role="alert"
                className="mt-2 text-xs text-destructive flex items-start gap-1.5 font-bangla"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground font-bangla">
                {copy.sub}
              </p>
            )}
          </>
        )}
      </aside>
    );
  }

  // ===== DEFAULT variant =====
  return (
    <aside
      className={`not-prose my-8 rounded-2xl border border-border bg-card p-5 md:p-6 ${className}`}
      data-analytics="newsletter-inline"
      data-variant={variant}
    >
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
            {copy.icon}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base md:text-lg font-bold leading-tight font-bangla">
              {copy.title}
            </p>
            <p className="text-xs text-muted-foreground font-bangla">{copy.sub}</p>
          </div>
        </div>
        {done ? Done : Form}
      </div>
    </aside>
  );
};

export default InlineNewsletter;
