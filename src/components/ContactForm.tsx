import { useEffect, useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { ensureRecaptcha, getRecaptchaToken } from "@/lib/recaptcha";

const Schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Message is too short").max(5000),
});

type FormState = z.infer<typeof Schema>;

const ContactForm = ({ accent }: { accent?: string }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    ensureRecaptcha().catch(() => {/* will retry on submit */});
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track("contact_submit_attempt", { source: "contact-page" });
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FormState;
        fe[k] = i.message;
      });
      setErrors(fe);
      track("contact_submit_error", { source: "contact-page", reason: "validation", fields: Object.keys(fe) });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken("contact_submit");
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: { ...parsed.data, recaptchaToken },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setDone(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: "Message sent", description: "We'll get back to you shortly." });
      track("contact_submit_success", { source: "contact-page", hasSubject: !!parsed.data.subject });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
      track("contact_submit_error", { source: "contact-page", reason: "network", message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">Thank you!</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Your message has been sent. We typically reply within 1–2 business days.
        </p>
        <Button variant="outline" onClick={() => setDone(false)}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">Name</Label>
          <Input id="cf-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" maxLength={200} />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input id="cf-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" maxLength={255} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-subject">Subject (optional)</Label>
        <Input id="cf-subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="What's it about?" maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-message">Message</Label>
        <Textarea id="cf-message" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Write your message…" rows={6} maxLength={5000} />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
        {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>) : (<><Send className="h-4 w-4 mr-2" /> Send message</>)}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Privacy Policy</a>{" "}and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Terms of Service</a> apply.
      </p>
    </form>
  );
};

export default ContactForm;
