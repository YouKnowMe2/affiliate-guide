import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";
import blog4 from "@/assets/blog-4.jpg";

export type ContentType = "Informational" | "Commercial" | "Comparison" | "Tutorial";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** WordPress rendered HTML content (optional for seed entries). */
  content?: string;
  contentType: ContentType;
  category: "Beginner" | "SEO" | "Tools" | "Case Study";
  readTime: string;
  date: string;
  image: string;
  author: string;
  /** Money-page slug to push affiliate clicks toward, e.g. "hosting" */
  monetization?: "hosting" | "seo" | "keyword" | "email";
  /** Free-form tags (slugs). Falls back to derived tags from monetization+category. */
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    robots?: string;
  };
};

/** Derive effective tag slugs for a post (used when WP tags are unavailable). */
export const getPostTags = (p: Post): string[] => {
  if (p.tags?.length) return p.tags;
  const t = new Set<string>();
  if (p.monetization) t.add(p.monetization);
  if (p.category) t.add(p.category.toLowerCase().replace(/\s+/g, "-"));
  return Array.from(t);
};

export const posts: Post[] = [
  {
    slug: "affiliate-marketing-beginner-guide",
    title: "Affiliate Marketing শুরু করার Complete Beginner Guide ২০২৬",
    excerpt: "শূন্য অভিজ্ঞতা থেকে প্রথম ১০০ ডলার আয় পর্যন্ত — পুরো রোডম্যাপ একদম সহজ ভাষায়।",
    contentType: "Informational",
    category: "Beginner",
    readTime: "১২ মিনিট",
    date: "Apr 20, 2026",
    image: blog1,
    author: "Shawon",
    monetization: "hosting",
  },
  {
    slug: "best-hosting-for-beginners",
    title: "Best Hosting for Beginners ২০২৬ — Bangladesh থেকে কোনটা নেবেন?",
    excerpt: "Hostinger, Bluehost, Namecheap — তিনটির head-to-head comparison ও honest recommendation।",
    contentType: "Commercial",
    category: "Tools",
    readTime: "১০ মিনিট",
    date: "Apr 18, 2026",
    image: blog3,
    author: "Shawon",
    monetization: "hosting",
  },
  {
    slug: "hostinger-vs-bluehost",
    title: "Hostinger vs Bluehost: কোনটা বেশি ভালো?",
    excerpt: "Speed, price, support, beginner friendliness — সব দিক থেকে detailed comparison।",
    contentType: "Comparison",
    category: "Tools",
    readTime: "৮ মিনিট",
    date: "Apr 15, 2026",
    image: blog3,
    author: "Shawon",
    monetization: "hosting",
  },
  {
    slug: "step-by-step-website-setup",
    title: "Step-by-Step WordPress Website Setup Tutorial",
    excerpt: "Domain কেনা থেকে theme install — ৩০ মিনিটে launch করুন আপনার first affiliate site।",
    contentType: "Tutorial",
    category: "Beginner",
    readTime: "১৫ মিনিট",
    date: "Apr 12, 2026",
    image: blog1,
    author: "Shawon",
    monetization: "hosting",
  },
  {
    slug: "seo-for-affiliate-sites",
    title: "Affiliate Site-এর জন্য SEO: Google-এ র‍্যাঙ্ক করার Proven Strategy",
    excerpt: "Keyword research, on-page optimization ও backlink — প্রতিটি ধাপ details সহ।",
    contentType: "Informational",
    category: "SEO",
    readTime: "১৫ মিনিট",
    date: "Apr 14, 2026",
    image: blog2,
    author: "Shawon",
    monetization: "seo",
  },
  {
    slug: "best-seo-tools-2026",
    title: "Best SEO Tools ২০২৬ — Beginner থেকে Pro পর্যন্ত",
    excerpt: "Ahrefs, SEMrush, Ubersuggest — কোনটা কার জন্য উপযুক্ত?",
    contentType: "Commercial",
    category: "SEO",
    readTime: "১১ মিনিট",
    date: "Apr 10, 2026",
    image: blog2,
    author: "Shawon",
    monetization: "seo",
  },
  {
    slug: "keyword-research-bangla",
    title: "বাংলা ব্লগের জন্য Keyword Research: Step-by-Step",
    excerpt: "Low competition keyword খুঁজে বাংলায় Affiliate site grow করার পদ্ধতি।",
    contentType: "Tutorial",
    category: "SEO",
    readTime: "৯ মিনিট",
    date: "Mar 15, 2026",
    image: blog2,
    author: "Shawon",
    monetization: "keyword",
  },
  {
    slug: "email-list-building",
    title: "Email List Building: Affiliate আয় ২x করার সবচেয়ে কার্যকর উপায়",
    excerpt: "Lead magnet থেকে automation — পুরো funnel সেটআপ একটি গাইডে।",
    contentType: "Tutorial",
    category: "Beginner",
    readTime: "১১ মিনিট",
    date: "Mar 22, 2026",
    image: blog1,
    author: "Shawon",
    monetization: "email",
  },
  {
    slug: "case-study-1000-dollar-month",
    title: "Case Study: কীভাবে ৬ মাসে $১০০০/মাস আয় করলাম",
    excerpt: "একটি micro-niche site দিয়ে আয় শুরু থেকে $1k/mo পর্যন্ত পুরো জার্নি।",
    contentType: "Informational",
    category: "Case Study",
    readTime: "৮ মিনিট",
    date: "Mar 30, 2026",
    image: blog4,
    author: "Shawon",
  },
];
