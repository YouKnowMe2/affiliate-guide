/**
 * Maps WordPress page slugs to React design templates.
 * Each entry defines the hero gradient, eyebrow tag, primary CTA, and the
 * route path used by the React Router.
 */
export type TemplateVariant =
  | "guide"      // long-form tutorial / pillar
  | "reviews"    // affiliate program reviews
  | "resources"  // toolkit / downloads
  | "tools"      // tools listing
  | "tutorial"   // step-by-step
  | "about"      // about / brand
  | "contact"    // contact
  | "legal"      // privacy / disclosure
  | "default";   // generic article

export interface PageTemplate {
  slug: string;
  path: string;
  variant: TemplateVariant;
  eyebrow: string;
  gradient: string; // tailwind from-/to- classes
  cta: { label: string; to: string };
  icon: string;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    slug: "guides",
    path: "/guides",
    variant: "guide",
    eyebrow: "মাস্টার গাইড",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    cta: { label: "টুলস দেখুন", to: "/tools" },
    icon: "📘",
  },
  {
    slug: "starter-guide",
    path: "/starter-guide",
    variant: "guide",
    eyebrow: "শুরু করুন",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    cta: { label: "প্রথম টুল বেছে নিন", to: "/tools" },
    icon: "🚀",
  },
  {
    slug: "affiliate-marketing-bangladesh",
    path: "/affiliate-marketing-bangladesh",
    variant: "guide",
    eyebrow: "বাংলাদেশ গাইড",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    cta: { label: "সম্পূর্ণ গাইড", to: "/guides" },
    icon: "🇧🇩",
  },
  {
    slug: "reviews",
    path: "/reviews",
    variant: "reviews",
    eyebrow: "অ্যাফিলিয়েট রিভিউ",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    cta: { label: "টপ টুলস কম্পেয়ার", to: "/tools" },
    icon: "⭐",
  },
  {
    slug: "resources",
    path: "/resources",
    variant: "resources",
    eyebrow: "ফ্রি রিসোর্স",
    gradient: "from-sky-500 via-indigo-500 to-purple-500",
    cta: { label: "টুলস বক্স", to: "/tools" },
    icon: "🎁",
  },
  {
    slug: "tools",
    path: "/wp-tools",
    variant: "tools",
    eyebrow: "টুলস গাইড",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    cta: { label: "সব টুলস", to: "/tools" },
    icon: "🛠️",
  },
  {
    slug: "tutorials",
    path: "/tutorials",
    variant: "tutorial",
    eyebrow: "টিউটোরিয়াল",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    cta: { label: "স্টেপ-বাই-স্টেপ", to: "/step-by-step-tutorial" },
    icon: "🎓",
  },
  {
    slug: "step-by-step-tutorial",
    path: "/step-by-step-tutorial",
    variant: "tutorial",
    eyebrow: "ফুল ওয়াকথ্রু",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    cta: { label: "টুলস সেটআপ করুন", to: "/tools" },
    icon: "🧭",
  },
  {
    slug: "product-review-template",
    path: "/product-review-template",
    variant: "reviews",
    eyebrow: "টেমপ্লেট",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    cta: { label: "রিভিউ পড়ুন", to: "/reviews" },
    icon: "📝",
  },
  {
    slug: "about-us",
    path: "/about-us",
    variant: "about",
    eyebrow: "আমাদের সম্পর্কে",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    cta: { label: "যোগাযোগ করুন", to: "/contact" },
    icon: "🌟",
  },
  {
    slug: "contact",
    path: "/wp-contact",
    variant: "contact",
    eyebrow: "যোগাযোগ",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    cta: { label: "ইমেইল পাঠান", to: "mailto:hello@affiliateguidance.com" },
    icon: "✉️",
  },
  {
    slug: "affiliate-disclosure",
    path: "/affiliate-disclosure",
    variant: "legal",
    eyebrow: "ডিসক্লোজার",
    gradient: "from-slate-500 via-zinc-500 to-neutral-500",
    cta: { label: "হোমে ফিরুন", to: "/" },
    icon: "📜",
  },
  {
    slug: "privacy-policy-2",
    path: "/privacy-policy",
    variant: "legal",
    eyebrow: "প্রাইভেসি",
    gradient: "from-slate-500 via-gray-500 to-zinc-500",
    cta: { label: "হোমে ফিরুন", to: "/" },
    icon: "🔒",
  },
];

export const DEFAULT_TEMPLATE: Omit<PageTemplate, "slug" | "path"> = {
  variant: "default",
  eyebrow: "আর্টিকেল",
  gradient: "from-primary via-primary to-primary/70",
  cta: { label: "হোমে ফিরুন", to: "/" },
  icon: "✨",
};

export const getTemplateBySlug = (slug: string): PageTemplate | undefined =>
  PAGE_TEMPLATES.find((t) => t.slug === slug);
