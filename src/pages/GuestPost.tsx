import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import {
  ChevronRight,
  FileText,
  Loader2,
  CheckCircle2,
  Send,
  Upload,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { track, type AnalyticsEvent } from "@/lib/analytics";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB hard cap (Resend attachment limit)

const Schema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    email: z.string().trim().email("Invalid email").max(255),
    title: z.string().trim().min(5, "Article title is required").max(200),
    excerpt: z
      .string()
      .trim()
      .min(20, "Please add a short summary (20+ chars)")
      .max(500),
    bio: z.string().trim().max(500).optional(),
    docUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(500)
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => !d.docUrl || /docs\.google\.com\/document\//.test(d.docUrl), {
    message: "Must be a docs.google.com link",
    path: ["docUrl"],
  });

type FormState = z.infer<typeof Schema>;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      // strip "data:...;base64," prefix
      const idx = res.indexOf(",");
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const GuestPost = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    title: "",
    excerpt: "",
    bio: "",
    docUrl: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onPickFile = (f: File | null) => {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const ok =
      f.type === DOCX_MIME ||
      f.name.toLowerCase().endsWith(".docx");
    if (!ok) {
      setFileError("Only .docx files are accepted.");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError("File is too large (max 10 MB).");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    track("guest_post_submit_attempt" as AnalyticsEvent, {});
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
    if (!file && !parsed.data.docUrl) {
      setFileError("Attach a .docx file OR paste a Google Doc link.");
      return;
    }
    setErrors({});
    setFileError(null);
    setLoading(true);
    try {
      let attachment: { filename: string; content: string; contentType: string } | null = null;
      if (file) {
        const content = await fileToBase64(file);
        attachment = { filename: file.name, content, contentType: DOCX_MIME };
      }

      const { data, error } = await supabase.functions.invoke(
        "send-submission-email",
        {
          body: {
            type: "guest_post",
            replyTo: parsed.data.email,
            payload: {
              name: parsed.data.name,
              email: parsed.data.email,
              title: parsed.data.title,
              excerpt: parsed.data.excerpt,
              bio: parsed.data.bio || "",
              google_doc: parsed.data.docUrl || "",
              attached_file: file ? file.name : "(none)",
            },
            attachment,
          },
        },
      );
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);

      setDone(true);
      setForm({ name: "", email: "", title: "", excerpt: "", bio: "", docUrl: "" });
      setFile(null);
      toast({ title: "Submission received", description: "We'll review and reply within 5–7 days." });
      track("guest_post_submit_success" as AnalyticsEvent, { hasFile: !!attachment, hasDocUrl: !!parsed.data.docUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Failed to send", description: msg, variant: "destructive" });
      track("guest_post_submit_error" as AnalyticsEvent, { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SEO
        title="Write for Us — Guest Post Submission · Affiliate Guidance"
        description="Submit a guest post on hosting, SEO, and affiliate marketing. Upload a .docx or share a Google Doc link."
        canonical="/guest-post"
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-12 md:py-16">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-foreground font-medium">Guest Post</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="h-3 w-3" /> For Writers
            </span>
            <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">
              Write for Affiliate Guidance
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-bangla">
              আপনার hosting, SEO, বা affiliate marketing-related আর্টিকেল আমাদের ব্লগে publish করতে চান? নিচের ফর্মে আপনার পোস্ট পাঠান।
            </p>
          </div>
        </div>
      </header>

      <div className="container-app py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12 max-w-5xl mx-auto">
          {/* FORM */}
          <div className="min-w-0">
            {done ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-success/10 grid place-items-center mb-5">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Submission received!</h2>
                <p className="text-muted-foreground font-bangla mb-6">
                  ধন্যবাদ! আমরা ৫–৭ কর্মদিবসের মধ্যে আপনাকে ইমেইলে জানাবো।
                </p>
                <Button variant="outline" onClick={() => setDone(false)}>
                  Submit another
                </Button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gp-name">Your name *</Label>
                    <Input
                      id="gp-name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      maxLength={120}
                      className="mt-1.5"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="gp-email">Email *</Label>
                    <Input
                      id="gp-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      maxLength={255}
                      className="mt-1.5"
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gp-title">Article title *</Label>
                  <Input
                    id="gp-title"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    maxLength={200}
                    className="mt-1.5"
                  />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="gp-excerpt">Short summary *</Label>
                  <Textarea
                    id="gp-excerpt"
                    rows={3}
                    value={form.excerpt}
                    onChange={(e) => set("excerpt", e.target.value)}
                    maxLength={500}
                    className="mt-1.5"
                    placeholder="2–3 sentences about what this post covers."
                  />
                  {errors.excerpt && <p className="text-xs text-destructive mt-1">{errors.excerpt}</p>}
                </div>

                <div>
                  <Label htmlFor="gp-bio">Author bio (optional)</Label>
                  <Textarea
                    id="gp-bio"
                    rows={2}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    maxLength={500}
                    className="mt-1.5"
                    placeholder="A line or two about you, plus a link to your website / LinkedIn."
                  />
                </div>

                {/* File OR Google Doc link */}
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
                  <p className="font-display text-sm font-bold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Article content *
                  </p>

                  {/* Upload */}
                  <div>
                    <label
                      htmlFor="gp-file"
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Upload className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm truncate">
                          {file ? file.name : "Upload .docx file (max 10 MB)"}
                        </span>
                      </div>
                      {file && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onPickFile(null);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </label>
                    <input
                      id="gp-file"
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="text-center text-xs text-muted-foreground my-3">— OR —</div>

                  {/* Google Doc URL */}
                  <div>
                    <Label htmlFor="gp-docurl" className="text-xs">
                      Google Doc share link
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="gp-docurl"
                        type="url"
                        value={form.docUrl}
                        onChange={(e) => set("docUrl", e.target.value)}
                        placeholder="https://docs.google.com/document/d/..."
                        maxLength={500}
                        className="pr-10"
                      />
                      <ExternalLink className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Make sure share access is set to "Anyone with the link can view".
                    </p>
                    {errors.docUrl && (
                      <p className="text-xs text-destructive mt-1">{errors.docUrl}</p>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-xs text-destructive mt-3">{fileError}</p>
                  )}
                </div>

                <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit guest post
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* SIDEBAR — guidelines */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-3">
                Submission Guidelines
              </h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Original, never-published content (no AI dump).",
                  "1,200+ words, clear structure with H2/H3.",
                  "Topic: hosting, SEO, affiliate, content strategy.",
                  "Up to 1 contextual do-follow link to your site.",
                  "We may edit for clarity, grammar, and house style.",
                ].map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-5">
              <p className="text-[10px] uppercase tracking-wider text-accent font-bold mb-1">
                Want a paid placement instead?
              </p>
              <h4 className="font-display text-sm font-bold leading-tight mb-3">
                Sponsored content & link insertions
              </h4>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/sponsored">See sponsorship options</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default GuestPost;
