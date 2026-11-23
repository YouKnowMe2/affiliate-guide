import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Star, TrendingUp, Users, Award, BookOpen,
  Search, Check, Mail, Zap, AlertTriangle, Compass, Wallet,
  Map, Globe, FileText, DollarSign, Clock, Server, KeyRound, Shield, Flame,
  Folder, Calendar, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import Testimonials from "@/components/home/Testimonials";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import { usePosts, usePostCategories, usePage } from "@/lib/cms";
import heroBg from "@/assets/hero-bg.jpg";
import heroIllustration from "@/assets/blog-1.jpg";
import founder from "@/assets/founder.jpg";

/* ───────────────────────── 1. HERO ───────────────────────── */
const Hero = () => (
  <section className="relative overflow-hidden">
    <div
      className="absolute inset-0 -z-10 opacity-30 dark:opacity-50"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/85 to-background" />
    <div className="absolute inset-0 -z-10 mesh-bg" />

    <div className="container-app pt-10 pb-20 md:pt-16 md:pb-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="animate-fade-up text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            অনেকে already শুরু করেছে · আপনি কেন পিছিয়ে?
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight font-bangla">
            ঘরে বসে <span className="gradient-text">Affiliate Marketing</span> শিখে অনলাইনে আয় শুরু করুন <span className="inline-block">💰</span>
          </h1>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed font-bangla">
            Zero থেকে earning পর্যন্ত complete guideline — কোনো experience দরকার নেই।
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button variant="hero" size="xl" asChild>
              <Link to="/blog">🚀 এখনই শুরু করুন</Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/tools">🔥 Best Tools দেখুন</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["100% Beginner Friendly", "Free Guides", "Updated 2026"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> {t}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
            <span>4.9/5 · ২,৪০০+ পাঠকের রেটিং</span>
          </div>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="absolute -inset-8 bg-gradient-primary opacity-25 blur-3xl rounded-full" />
          <div className="relative card-premium p-3 animate-float">
            <img
              src={heroIllustration}
              alt="Affiliate Marketing earning illustration"
              width={1200}
              height={800}
              fetchPriority="high"
              decoding="async"
              className="rounded-2xl w-full"
            />
          </div>
          <div className="hidden md:flex absolute -left-4 top-10 glass rounded-2xl px-4 py-3 items-center gap-3 shadow-premium-md animate-float" style={{ animationDelay: "0.4s" }}>
            <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center">
              <DollarSign className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">এই মাসে আয়</div>
              <div className="font-display font-bold">$১,২৪০</div>
            </div>
          </div>
          <div className="hidden md:flex absolute -right-4 bottom-8 glass rounded-2xl px-4 py-3 items-center gap-3 shadow-premium-md animate-float" style={{ animationDelay: "0.8s" }}>
            <div className="h-9 w-9 rounded-lg bg-success/20 grid place-items-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Conversion</div>
              <div className="font-display font-bold">+৩২%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {[
          { icon: Users, value: "১০K+", label: "Students" },
          { icon: BookOpen, value: "১২০+", label: "Articles" },
          { icon: TrendingUp, value: "$৫০K+", label: "Earned" },
          { icon: Award, value: "৫+ Yrs", label: "Experience" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="glass rounded-2xl p-4 text-center">
            <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
            <div className="font-display text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ──────────────────── 2. PROBLEM → SOLUTION ──────────────────── */
const ProblemSolution = () => {
  const pains = [
    { icon: AlertTriangle, title: "অনেক tutorial দেখে confused?", desc: "একেক জন একেক কথা বলে — বুঝতে পারছেন না কোনটা সঠিক।" },
    { icon: Compass, title: "কোন niche নেবেন বুঝতে পারছেন না?", desc: "Profitable niche খুঁজে বের করার সঠিক method জানা নেই।" },
    { icon: Wallet, title: "Earning শুরু করতে পারছেন না?", desc: "মাসের পর মাস কাজ করেও প্রথম sale আসছে না।" },
  ];
  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-3">
            PROBLEM
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla leading-tight">
            অনলাইনে আয় করতে চান কিন্তু <span className="gradient-text">কোথা থেকে শুরু করবেন</span> বুঝতে পারছেন না?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {pains.map((p) => (
            <div key={p.title} className="card-premium p-6 border-destructive/15">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 grid place-items-center mb-4">
                <p.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-bold text-lg mb-2 font-bangla">{p.title}</h3>
              <p className="text-sm text-muted-foreground font-bangla">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto rounded-3xl bg-gradient-hero p-8 md:p-12 text-center text-white overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70 font-semibold mb-3">SOLUTION</p>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-snug font-bangla">
              Affiliate Guidance আপনাকে step-by-step clear roadmap দেখাবে 👇
            </h3>
            <Button variant="hero-outline" size="lg" className="mt-6 bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground" asChild>
              <Link to="/blog">📘 Roadmap দেখুন <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────── 3. STEP-BY-STEP SYSTEM ─────────────────── */
const Steps = () => {
  const steps = [
    { emoji: "🎯", icon: Map, title: "Niche নির্বাচন", desc: "এমন niche বেছে নিন যেখানে demand আছে এবং আপনার আগ্রহ আছে।" },
    { emoji: "🌐", icon: Globe, title: "Website তৈরি", desc: "Hosting + Domain নিয়ে ৩০ মিনিটে professional সাইট launch করুন।" },
    { emoji: "✍️", icon: FileText, title: "Content & SEO", desc: "Quality content লিখুন ও SEO দিয়ে Google-এ rank করুন।" },
    { emoji: "💰", icon: DollarSign, title: "Income শুরু", desc: "Affiliate links থেকে commission income শুরু করুন।" },
  ];
  return (
    <section className="section-pad relative">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            ROADMAP
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
            Affiliate Marketing শেখার <span className="gradient-text">সহজ ৪ ধাপ</span>
          </h2>
          <p className="mt-4 text-muted-foreground font-bangla">Confusion শেষ — শুধু এই path টা follow করুন।</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="card-premium p-6 relative group">
              <div className="absolute top-4 right-4 font-display text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                0{i + 1}
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center mb-4 shadow-premium-glow text-2xl">
                {s.emoji}
              </div>
              <h3 className="font-semibold text-lg mb-2 font-bangla">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-bangla">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="cta" size="lg" asChild>
            <Link to="/blog">📘 Full Guide দেখুন <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────── 4. FEATURED GUIDES ──────────────────── */
const FeaturedGuides = () => {
  const guides = [
    { title: "Beginner Guide", desc: "Affiliate marketing কীভাবে শুরু করবেন সহজভাবে।", icon: BookOpen, color: "from-blue-500 to-indigo-500" },
    { title: "SEO Guide", desc: "Free traffic নিয়ে আসার powerful strategy।", icon: Search, color: "from-violet-500 to-purple-500" },
    { title: "Passive Income", desc: "কীভাবে long-term income build করবেন।", icon: TrendingUp, color: "from-pink-500 to-rose-500" },
    { title: "Free Traffic", desc: "Paid ads ছাড়াই visitor আনার উপায়।", icon: Zap, color: "from-amber-500 to-orange-500" },
  ];
  return (
    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            GUIDES
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold font-bangla">
            আপনার জন্য <span className="gradient-text">গুরুত্বপূর্ণ গাইড</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {guides.map((g) => (
            <Link key={g.title} to="/blog" className="card-premium p-6 group flex flex-col">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${g.color} grid place-items-center mb-5 shadow-premium-md group-hover:scale-110 transition-transform`}>
                <g.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">{g.title}</h3>
              <p className="text-sm text-muted-foreground font-bangla flex-1 mb-5">{g.desc}</p>
              <div className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                পড়ুন <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────── 5. BEST AFFILIATE TOOLS ─────────────────── */
const BestTools = () => {
  const items = [
    {
      icon: Server,
      color: "from-violet-500 to-fuchsia-500",
      tag: "Hosting",
      slug: "hosting",
      title: "Fast & Reliable Hosting",
      desc: "Affiliate website শুরু করার জন্য fast hosting সবচেয়ে গুরুত্বপূর্ণ।",
      cta: "👉 এখনই Hosting নিন",
      trust: "আমি নিজেও এই hosting ব্যবহার করি",
      badge: "Most Popular",
    },
    {
      icon: Search,
      color: "from-blue-500 to-indigo-600",
      tag: "SEO Tool",
      slug: "seo",
      title: "All-in-One SEO Tool",
      desc: "Keyword research, competitor analysis — সব এক জায়গায়।",
      cta: "👉 SEO Tool চেক করুন",
      trust: "৩+ বছর ধরে personally use করছি",
    },
    {
      icon: KeyRound,
      color: "from-pink-500 to-rose-500",
      tag: "Keyword Tool",
      slug: "keyword",
      title: "Keyword Research Tool",
      desc: "Low competition keyword খুঁজে ranking পাওয়ার জন্য।",
      cta: "👉 Keyword খুঁজুন এখনই",
      trust: "প্রতিটি article-এ এটাই use করি",
    },
    {
      icon: Mail,
      color: "from-emerald-500 to-teal-500",
      tag: "Email Marketing",
      slug: "email",
      title: "Email Marketing Tool",
      desc: "Email list = passive income — algorithm-এর উপর depend করতে হবে না।",
      cta: "👉 Email list শুরু করুন",
      trust: "Long-term income এর জন্য must",
    },
  ];

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-50" />
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Flame className="h-3 w-3" /> RECOMMENDED
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
            আমার personally ব্যবহার করা <span className="gradient-text">সেরা tools</span> 🔥
          </h2>
          <p className="mt-4 text-muted-foreground font-bangla">নিজে test করেছি, তারপর recommend করছি — honest review।</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {items.map((t) => (
            <div key={t.tag} className="card-premium p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${t.color} grid place-items-center text-white shadow-premium-md`}>
                  <t.icon className="h-7 w-7" />
                </div>
                {t.badge && (
                  <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">{t.badge}</span>
                )}
              </div>
              <span className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">{t.tag}</span>
              <h3 className="font-display text-lg font-bold mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground font-bangla flex-1 mb-4">{t.desc}</p>

              <div className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-success/5 border border-success/15">
                <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground italic font-bangla">"{t.trust}"</p>
              </div>

              <Button variant="cta" className="w-full" asChild>
                <Link to={`/tools/${t.slug}`}>{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="card-premium overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-secondary/40">
            <h3 className="font-display text-xl font-bold">Quick Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1 font-bangla">এক নজরে দেখে নিন কোনটা আপনার জন্য best।</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b border-border">
                  <th className="px-5 py-4 font-semibold">Tool</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Key Features</th>
                  <th className="px-5 py-4 font-semibold">Best for Beginners</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Hosting", price: "$2.99/mo", feat: "Free SSL, Free Domain, Speed", best: true },
                  { name: "SEO Tool", price: "$99/mo", feat: "Keyword + Backlink + Audit", best: false },
                  { name: "Keyword Tool", price: "$29/mo", feat: "Long-tail keyword, SERP data", best: true },
                ].map((row, i) => (
                  <tr key={row.name} className={i % 2 ? "bg-surface" : ""}>
                    <td className="px-5 py-4 font-semibold">{row.name}</td>
                    <td className="px-5 py-4 font-semibold text-primary">{row.price}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.feat}</td>
                    <td className="px-5 py-4">
                      {row.best ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">
                          <Check className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                          Pro Level
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Button variant="soft" size="sm">Check</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/tools">সব Tools দেখুন <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ─────────── 5.5 FEATURED RECOMMENDATIONS (Own Tools + Alternatives) ─────────── */
const FeaturedRecommendations = () => {
  const features = [
    {
      type: "Hosting",
      icon: Server,
      color: "from-violet-500 to-fuchsia-500",
      badge: "🏆 Top Pick",
      title: "Best Hosting for Beginners",
      name: "Cloudoora Hosting",
      desc: "Fast, affordable এবং beginner-friendly hosting — affiliate websites-এর জন্য specially optimized।",
      bullets: [
        "Recommended for beginners in Bangladesh",
        "Easy setup + local Bangla support",
        "bKash payment + ৳১৯০/mo থেকে শুরু",
      ],
      cta: "🚀 আজই Cloudoora দিয়ে website শুরু করুন",
      ctaShort: "👉 Cloudoora দিয়ে শুরু করুন",
      slug: "cloudoora",
      cat: "hosting",
      alts: [
        { name: "Hostinger", note: "Global option, English support" },
        { name: "Namecheap", note: "Cheapest reliable choice" },
      ],
    },
    {
      type: "SEO Tool",
      icon: Search,
      color: "from-blue-500 to-indigo-600",
      badge: "🏆 Recommended Tool",
      title: "All-in-One SEO & Content Tool",
      name: "Ranksuite",
      desc: "Keyword research, AI content writing এবং SEO optimization — সব এক জায়গায়।",
      bullets: [
        "Beginner friendly — no SEO knowledge দরকার",
        "Time saving AI content writer",
        "Bangla writers-দের জন্য specially tuned",
      ],
      cta: "✍️ সহজে SEO content তৈরি করুন",
      ctaShort: "👉 Ranksuite ব্যবহার করুন",
      slug: "ranksuite",
      cat: "seo",
      alts: [
        { name: "Ubersuggest", note: "Budget-friendly beginner tool" },
        { name: "Ahrefs", note: "Pro-level authority reference" },
      ],
    },
  ];

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-40" />
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Award className="h-3 w-3" /> HONEST RECOMMENDATIONS
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
            আমাদের <span className="gradient-text">Top Picks</span> — সাথে alternative options
          </h2>
          <p className="mt-4 text-muted-foreground font-bangla">
            "আমি personally এই tools recommend করি কারণ এগুলো test করেছি ও beginners-এর জন্য সবচেয়ে easy।"
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((f) => (
            <div key={f.name} className="card-premium p-7 relative flex flex-col">
              <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-premium-md">
                {f.badge}
              </span>
              <div className="flex items-center gap-4 mb-5 mt-2">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${f.color} grid place-items-center text-white shadow-premium-md shrink-0`}>
                  <f.icon className="h-8 w-8" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary font-semibold">{f.type}</span>
                  <h3 className="font-display text-xl font-bold leading-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.name}</p>
                </div>
              </div>

              <p className="text-sm text-foreground/80 font-bangla mb-4">{f.desc}</p>

              <ul className="space-y-2 mb-5">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm font-bangla">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Button variant="cta" size="lg" className="w-full mb-5" asChild>
                <Link to={`/tools/${f.cat}/${f.slug}`}>{f.ctaShort}</Link>
              </Button>

              {/* Alternatives — for trust */}
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other Options</p>
                  <Link to={`/tools/${f.cat}`} className="text-xs font-semibold text-primary hover:underline">
                    Compare →
                  </Link>
                </div>
                <div className="space-y-2">
                  {f.alts.map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-xs text-muted-foreground font-bangla truncate ml-3">{a.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Honest comparison table */}
        <div className="card-premium overflow-hidden mt-12">
          <div className="px-6 py-5 border-b border-border bg-secondary/40 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display text-xl font-bold">Honest Comparison</h3>
              <p className="text-sm text-muted-foreground mt-1 font-bangla">কোনটা আপনার জন্য best — নিজে দেখুন।</p>
            </div>
            <span className="text-xs text-muted-foreground italic font-bangla">No bias. Real comparison.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-left">
                <tr className="border-b border-border">
                  <th className="px-5 py-4 font-semibold">Tool</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Beginner Friendly</th>
                  <th className="px-5 py-4 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Cloudoora Hosting", price: "৳১৯০/mo", bf: true, best: "BD beginners + local support", top: true },
                  { name: "Hostinger", price: "$2.99/mo", bf: true, best: "Global users" },
                  { name: "Namecheap", price: "$1.58/mo", bf: true, best: "Tight budget" },
                  { name: "Ranksuite", price: "৳৪৯০/mo", bf: true, best: "SEO + AI content writing", top: true },
                  { name: "Ubersuggest", price: "$12/mo", bf: true, best: "Basic keyword research" },
                  { name: "Ahrefs", price: "$99/mo", bf: false, best: "Pro-level analysis" },
                ].map((row, i) => (
                  <tr key={row.name} className={`${i % 2 ? "bg-surface" : ""} ${row.top ? "ring-1 ring-inset ring-primary/30" : ""}`}>
                    <td className="px-5 py-4 font-semibold">
                      <div className="flex items-center gap-2">
                        {row.name}
                        {row.top && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-primary text-white text-[10px] font-bold">TOP</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary">{row.price}</td>
                    <td className="px-5 py-4">
                      {row.bf ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">
                          <Check className="h-3 w-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                          Pro Level
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-bangla">{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};


/* ─────────── 6.A LATEST FROM THE BLOG (dynamic) ─────────── */
const LatestPosts = () => {
  const { data: posts = [], isLoading } = usePosts();
  const items = posts.slice(0, 6);

  return (
    <section className="section-pad">
      <div className="container-app">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <BookOpen className="h-3 w-3" /> LATEST POSTS
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
              নতুন <span className="gradient-text">ব্লগ পোস্ট</span> ও গাইড
            </h2>
            <p className="mt-3 text-muted-foreground font-bangla max-w-xl">
              সরাসরি WordPress থেকে — সর্বশেষ tutorial, review এবং case study।
            </p>
          </div>
          <Button variant="hero-outline" asChild className="hidden sm:inline-flex">
            <Link to="/blog">All Posts <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-premium overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className="card-premium overflow-hidden group flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      {p.contentType}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {p.date}
                    </span>
                    <span>· {p.readTime}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug font-bangla group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 font-bangla flex-1">
                    {p.excerpt}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Button variant="hero-outline" asChild>
            <Link to="/blog">All Posts <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ─────────── 6.B BROWSE BY CATEGORY (dynamic from WP) ─────────── */
const CATEGORY_PALETTE = [
  "from-violet-500 to-fuchsia-500",
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-sky-500",
  "from-purple-500 to-pink-500",
  "from-lime-500 to-green-500",
];

const BrowseCategories = () => {
  const { data: cats = [], isLoading } = usePostCategories();
  const visible = cats.filter((c) => c.count > 0).slice(0, 8);

  if (!isLoading && !visible.length) return null;

  return (
    <section className="section-pad bg-surface relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-30" />
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Folder className="h-3 w-3" /> BROWSE BY TOPIC
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
            আপনার পছন্দের <span className="gradient-text">ক্যাটাগরি</span> বেছে নিন
          </h2>
          <p className="mt-4 text-muted-foreground font-bangla">
            যেকোনো topic-এ সরাসরি ঢুকে পড়ুন — সব post এক জায়গায়।
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visible.map((c, i) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="card-premium p-6 group flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} grid place-items-center text-white shadow-premium-md group-hover:scale-110 transition-transform`}
                  >
                    <Tag className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {c.count} posts
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-base leading-snug font-bangla group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <div className="mt-2 text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button variant="hero-outline" asChild>
            <Link to="/categories">All Categories <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const PersonalBrand = () => (
  <section className="section-pad bg-surface">
    <div className="container-app">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
          <div className="relative card-premium p-2 max-w-md mx-auto">
            <img src={founder} alt="Shawon — Founder of Affiliate Guidance" loading="lazy" width={800} height={800} className="rounded-xl w-full" />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            👋 আমি কে?
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight font-bangla">
            Hi, আমি <span className="gradient-text">Shawon</span>
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed font-bangla">
            আমি Shawon, একজন SEO learner এবং affiliate marketing নিয়ে কাজ করছি।
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed font-bangla">
            আমি নিজেও শুরুতে অনেক confused ছিলাম — কিন্তু step-by-step শিখে এখন আমি আমার knowledge share করছি, যাতে আপনি সহজে শুরু করতে পারেন।
          </p>
          <div className="mt-6 space-y-3">
            {["১০,০০০+ student-কে শিখিয়েছি", "$৫০,০০০+ personal earning", "১২০+ in-depth article published"].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-success/15 grid place-items-center">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <span className="text-sm font-bangla">{t}</span>
              </div>
            ))}
          </div>
          <Button variant="cta" size="lg" className="mt-6" asChild>
            <Link to="/about">আমার গল্প পড়ুন <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

/* ──────────────────── 7. EMAIL CAPTURE ──────────────────── */
const EmailCTA = () => (
  <section className="section-pad">
    <div className="container-app">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-16 text-white">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-4 backdrop-blur">
              <Sparkles className="h-3 w-3" /> 100% FREE
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight font-bangla">
              Free Affiliate Marketing Guide নিতে চান?
            </h2>
            <p className="mt-4 text-white/85 font-bangla text-lg">
              Beginner থেকে earning পর্যন্ত roadmap PDF।
            </p>
          </div>
          <form className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <label className="text-sm font-semibold mb-2 block">আপনার Email দিন</label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 h-12">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" required placeholder="email@domain.com" className="flex-1 bg-transparent text-foreground text-sm focus:outline-none" />
              </div>
              <button className="h-12 px-6 rounded-xl bg-foreground text-background font-semibold text-sm hover:scale-[1.02] transition-transform whitespace-nowrap">
                📩 ফ্রি গাইড নিন
              </button>
            </div>
            <p className="mt-3 text-xs text-white/70">No spam. Unsubscribe anytime.</p>
          </form>
        </div>
      </div>
    </div>
  </section>
);

/* ──────────────────── 8. FINAL STRONG CTA ──────────────────── */
const FinalCTA = () => (
  <section className="section-pad">
    <div className="container-app">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-dark text-white p-10 md:p-20 text-center">
        <div className="absolute inset-0 -z-0 mesh-bg opacity-50" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold mb-5">
            <Clock className="h-3 w-3" /> দেরি মানে সুযোগ হারানো
          </div>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight font-bangla">
            দেরি না করে <span className="gradient-text">আজই শুরু করুন</span> 🚀
          </h2>
          <p className="mt-5 text-lg text-white/75 font-bangla">
            আজ শুরু করলে কাল earning এর পথে থাকবেন।
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/blog">💰 এখনই শুরু করুন</Link>
            </Button>
            <Button variant="hero-outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-foreground" asChild>
              <Link to="/tools">🔥 Best Tools দেখুন</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/90 font-bangla">⏳ আজই শুরু করলে — ৬ মাস পর আপনি নিজেকে ধন্যবাদ দেবেন।</p>
        </div>
      </div>
    </div>
  </section>
);


const Index = () => {
  const { data: homePage } = usePage("home");
  const seo = homePage?.seo;
  return (
  <>
    <SEO
      title={seo?.title || "Affiliate Guidance — বাংলায় Affiliate Marketing শিখুন"}
      description={seo?.description || "Affiliate marketing শূন্য থেকে শুরু করে প্রথম $1000 আয়ের complete বাংলা গাইড, premium tools ও real case study।"}
      keywords={seo?.keywords || "affiliate marketing bangla, affiliate marketing bangladesh, affiliate guide, blogging, SEO, hosting, online income"}
      canonical={seo?.canonical || "/"}
      image={homePage?.image}
      robots={seo?.robots}
      schemaHead={(seo as any)?.schemaHead}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Affiliate Guidance",
        url: typeof window !== "undefined" ? window.location.origin : "/",
        inLanguage: "bn-BD",
        potentialAction: {
          "@type": "SearchAction",
          target: typeof window !== "undefined" ? `${window.location.origin}/blog?q={query}` : "/blog?q={query}",
          "query-input": "required name=query",
        },
      }}
    />
    <Hero />
    <ProblemSolution />
    <Steps />
    <BrowseCategories />
    <FeaturedCarousel />
    <FeaturedGuides />
    <LatestPosts />
    <Testimonials />
    <FeaturedRecommendations />
    <BestTools />
    <PersonalBrand />
    <EmailCTA />
    <FinalCTA />
    <LeadCaptureModal />
  </>
  );
};

export default Index;
