import { useEffect, useState } from "react";
import { Mail, Sparkles, Check, Loader2, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "ag_lead_modal_shown_v1";
const SCROLL_THRESHOLD = 0.6; // 60%
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 768);

const LeadCaptureModal = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      cleanup();
    };

    const touch = isTouchDevice();

    // Exit-intent — desktop only
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };

    // Scroll trigger
    const onScroll = () => {
      const scrolled =
        (window.scrollY + window.innerHeight) /
        Math.max(1, document.documentElement.scrollHeight);
      if (scrolled >= SCROLL_THRESHOLD) trigger();
    };

    // Time-based fallback (60s mobile, 45s desktop)
    const timer = window.setTimeout(trigger, touch ? 60_000 : 45_000);

    const cleanup = () => {
      if (!touch) document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };

    if (!touch) document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Manual open via global event (e.g. mid-article CTA buttons)
    const onManualOpen = () => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      cleanup();
    };
    window.addEventListener("ag:open-lead-modal", onManualOpen);

    const baseCleanup = cleanup;
    return () => {
      baseCleanup();
      window.removeEventListener("ag:open-lead-modal", onManualOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !EMAIL_RE.test(cleanEmail)) {
      toast({
        title: "Invalid info",
        description: "একটি সঠিক নাম ও email দিন।",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      // Reuse existing email pipeline — send a lead notification.
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: cleanName,
          email: cleanEmail,
          subject: "🎁 Free Affiliate Guide Request",
          message:
            `New lead from Free Affiliate Guide modal\n\n` +
            `Name: ${cleanName}\nEmail: ${cleanEmail}\n` +
            `Source: lead-capture-modal\nTime: ${new Date().toISOString()}`,
        },
      });
      if (error) throw error;
      setDone(true);
      toast({
        title: "🎉 ধন্যবাদ!",
        description: "আপনার free guide শীঘ্রই inbox-এ পৌঁছাবে।",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md overflow-hidden p-0 gap-0">
        {/* Decorative banner */}
        <div className="relative bg-gradient-hero text-white p-6 pb-8">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3" /> 100% FREE · LIMITED TIME
            </div>
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center shrink-0">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-xl font-display font-bold leading-tight font-bangla text-white">
                    Free Affiliate Marketing Guide পান!
                  </DialogTitle>
                  <DialogDescription className="text-white/85 font-bangla text-sm">
                    Beginner থেকে $1000/মাস — complete roadmap PDF সরাসরি আপনার inbox-এ।
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 mx-auto rounded-full bg-success/15 grid place-items-center mb-4">
                <Check className="h-7 w-7 text-success" />
              </div>
              <h3 className="font-display text-lg font-bold mb-1 font-bangla">
                আপনি সফলভাবে subscribe করেছেন
              </h3>
              <p className="text-sm text-muted-foreground font-bangla">
                Inbox চেক করুন — guide পাঠানো হবে কয়েক মিনিটের মধ্যে।
              </p>
              <Button onClick={() => setOpen(false)} variant="outline" className="mt-5">
                Continue browsing
              </Button>
            </div>
          ) : (
            <>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="lead-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    আপনার নাম
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="যেমন: রাকিব হাসান"
                    className="mt-1.5 w-full h-11 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="lead-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 h-11 focus-within:ring-2 focus-within:ring-primary">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={255}
                      placeholder="email@domain.com"
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> পাঠানো হচ্ছে...
                    </>
                  ) : (
                    "📩 ফ্রি গাইড পাঠান"
                  )}
                </Button>
              </form>
              <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                {[
                  "৪০+ পৃষ্ঠার complete PDF guide",
                  "Step-by-step roadmap",
                  "Spam নেই — যেকোনো সময় unsubscribe",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2 font-bangla">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
