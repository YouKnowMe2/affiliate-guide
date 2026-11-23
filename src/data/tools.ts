export type ToolCategory = "hosting" | "seo" | "keyword" | "email";

export type ToolSEO = {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
};

export type Tool = {
  slug: string;
  name: string;
  category: ToolCategory;
  tagline: string;
  benefit: string;          // benefit-driven copy (Bangla)
  whyRecommend: string;     // honest "why I recommend"
  beginnerNote: string;     // beginner explanation
  rating: number;
  price: string;
  speed?: string;           // hosting
  freeTrial: boolean;
  beginnerFriendly: boolean;
  topPick?: boolean;
  badge?: string;
  url: string;
  initials: string;
  color: string;
  commission: string;
  seo?: ToolSEO;
  image?: string | null;
};

export type ToolCategoryMeta = {
  slug: ToolCategory;
  title: string;
  banglaTitle: string;
  shortDesc: string;
  hook: string;
  cta: string;
  icon: string; // emoji
  color: string;
  seo?: ToolSEO;
};

export const categories: ToolCategoryMeta[] = [
  {
    slug: "hosting",
    title: "Hosting",
    banglaTitle: "🌐 Hosting",
    shortDesc: "Affiliate website-এর foundation",
    hook: "Website বানাতে চান? Fast hosting ছাড়া Google-এ rank করা প্রায় অসম্ভব।",
    cta: "👉 Hosting নিন এখনই",
    icon: "🌐",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    slug: "seo",
    title: "SEO Tools",
    banglaTitle: "🔍 SEO Tools",
    shortDesc: "Free traffic আনার অস্ত্র",
    hook: "Google-এ rank করতে চান? সঠিক SEO tool ছাড়া অন্ধকারে কাজ করা।",
    cta: "👉 SEO Tool ব্যবহার করুন",
    icon: "🔍",
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "keyword",
    title: "Keyword Tools",
    banglaTitle: "🔑 Keyword Tools",
    shortDesc: "Low competition keyword খোঁজার tool",
    hook: "এমন keyword খুঁজছেন যেটা rank করা সহজ? এই tools-ই answer।",
    cta: "👉 Low competition keyword খুঁজুন",
    icon: "🔑",
    color: "from-cyan-500 to-blue-500",
  },
  {
    slug: "email",
    title: "Email Marketing",
    banglaTitle: "📧 Email Marketing",
    shortDesc: "Long-term passive income tool",
    hook: "Email list = আপনার own audience। Algorithm change-এও income সুরক্ষিত।",
    cta: "👉 Email list তৈরি করুন",
    icon: "📧",
    color: "from-pink-500 to-rose-500",
  },
];

export const tools: Tool[] = [
  // ─── HOSTING ───
  {
    slug: "cloudoora",
    name: "Cloudoora Hosting",
    category: "hosting",
    tagline: "Best Hosting for Beginners (Recommended)",
    benefit: "Fast, affordable এবং beginner-friendly hosting — affiliate website-এর জন্য specially optimized।",
    whyRecommend: "আমাদের নিজেদের hosting — Bangladesh-এর local support, bKash payment, এবং beginner-দের জন্য specially tuned servers।",
    beginnerNote: "১-click WordPress install + Bangla support team। প্রথমবার website বানালেও সমস্যা হবে না।",
    rating: 4.9,
    price: "৳১৯০/mo",
    speed: "৩১০ms",
    freeTrial: true,
    beginnerFriendly: true,
    topPick: true,
    badge: "🏆 Top Pick",
    url: "#",
    initials: "Cd",
    color: "from-violet-500 to-fuchsia-500",
    commission: "Own Product",
  },
  {
    slug: "hostinger",
    name: "Hostinger",
    category: "hosting",
    tagline: "Popular global alternative",
    benefit: "মাত্র $২.৯৯/mo থেকে শুরু — Free SSL, Free Domain, LiteSpeed servers।",
    whyRecommend: "Global option হিসেবে reliable। Local support নেই, তবে international users-দের জন্য ভালো।",
    beginnerNote: "১-click WordPress install আছে — তবে support English-এ।",
    rating: 4.6,
    price: "$2.99/mo",
    speed: "৪২০ms",
    freeTrial: false,
    beginnerFriendly: true,
    badge: "Alternative",
    url: "#",
    initials: "Hi",
    color: "from-sky-500 to-blue-600",
    commission: "60%",
  },
  {
    slug: "bluehost",
    name: "Bluehost",
    category: "hosting",
    tagline: "WordPress Officially Recommended",
    benefit: "WordPress.org অফিসিয়ালি recommend করে। Free domain ১ বছর + 24/7 support।",
    whyRecommend: "WordPress site-এর জন্য proven track record — ২০ মিলিয়ন+ site host করে।",
    beginnerNote: "User dashboard একদম clean — beginner এর জন্য confusion-free।",
    rating: 4.6,
    price: "$3.95/mo",
    speed: "৬১০ms",
    freeTrial: false,
    beginnerFriendly: true,
    badge: "WP Choice",
    url: "#",
    initials: "Bl",
    color: "from-sky-500 to-blue-600",
    commission: "$65/sale",
  },
  {
    slug: "namecheap",
    name: "Namecheap",
    category: "hosting",
    tagline: "Cheapest reliable option",
    benefit: "Domain + Hosting একসাথে অসম্ভব সস্তা দামে। Free WhoisGuard included।",
    whyRecommend: "Budget tight হলে Namecheap বেস্ট। Multiple domains হ্যান্ডেলের জন্য আদর্শ।",
    beginnerNote: "Setup interface একটু technical — তবে document খুব detailed।",
    rating: 4.4,
    price: "$1.58/mo",
    speed: "৭৮০ms",
    freeTrial: false,
    beginnerFriendly: true,
    url: "#",
    initials: "Nc",
    color: "from-orange-500 to-amber-500",
    commission: "20%",
  },

  // ─── SEO ───
  {
    slug: "ranksuite",
    name: "Ranksuite",
    category: "seo",
    tagline: "All-in-One SEO & Content Writing Tool",
    benefit: "Keyword research, AI content writing, এবং on-page SEO optimization — সব এক জায়গায়।",
    whyRecommend: "আমাদের নিজেদের tool — Bangla writers-দের কথা মাথায় রেখে বানানো। Time save হবে massive।",
    beginnerNote: "Beginner friendly interface — কোনো SEO knowledge ছাড়াই content optimize করতে পারবেন।",
    rating: 4.9,
    price: "৳৪৯০/mo",
    freeTrial: true,
    beginnerFriendly: true,
    topPick: true,
    badge: "🏆 Recommended Tool",
    url: "#",
    initials: "Rs",
    color: "from-blue-500 to-indigo-600",
    commission: "Own Product",
  },
  {
    slug: "ahrefs",
    name: "Ahrefs",
    category: "seo",
    tagline: "Industry-leading SEO suite",
    benefit: "Backlink analysis, keyword research, competitor tracking — সব এক জায়গায়।",
    whyRecommend: "Backlink database industry-best — authority reference হিসেবে mention করি।",
    beginnerNote: "Advanced tool — pro users-দের জন্য।",
    rating: 4.9,
    price: "$99/mo",
    freeTrial: false,
    beginnerFriendly: false,
    badge: "Pro Alternative",
    url: "#",
    initials: "Ah",
    color: "from-orange-500 to-red-500",
    commission: "$10–60",
  },
  {
    slug: "semrush",
    name: "SEMrush",
    category: "seo",
    tagline: "All-in-one marketing intelligence",
    benefit: "Keyword + competitor + ad analysis সম্পূর্ণ এক platform-এ। ৭ দিন free trial।",
    whyRecommend: "Content marketing ও competitor research-এর জন্য সবচেয়ে complete।",
    beginnerNote: "Interface intuitive — Ahrefs এর চেয়ে সহজে শেখা যায়।",
    rating: 4.7,
    price: "$129/mo",
    freeTrial: true,
    beginnerFriendly: true,
    badge: "Free Trial",
    url: "#",
    initials: "Se",
    color: "from-orange-500 to-rose-500",
    commission: "$200/sale",
  },
  {
    slug: "ubersuggest-seo",
    name: "Ubersuggest",
    category: "seo",
    tagline: "Neil Patel's beginner SEO",
    benefit: "Lifetime deal পাওয়া যায় — মাসিক payment-এর ঝামেলা নেই।",
    whyRecommend: "Budget-friendly beginner option। Basic SEO needs সম্পূর্ণ cover করে।",
    beginnerNote: "যারা Ahrefs/SEMrush afford করতে পারছেন না — তাদের জন্য perfect।",
    rating: 4.4,
    price: "$12/mo",
    freeTrial: true,
    beginnerFriendly: true,
    url: "#",
    initials: "Ub",
    color: "from-amber-500 to-orange-500",
    commission: "30%",
  },

  // ─── KEYWORD ───
  {
    slug: "ranksuite-keyword",
    name: "Ranksuite Keyword Research",
    category: "keyword",
    tagline: "Low-competition keyword discovery by Ranksuite",
    benefit: "Bangla + English long-tail keyword ও content gap analysis এক ক্লিকে — affiliate niche-এর জন্য specially tuned।",
    whyRecommend: "আমাদের নিজেদের Ranksuite platform — Bangladesh-এর local search trends ধরে keyword suggest করে।",
    beginnerNote: "Simple UI, difficulty meter color-coded — beginner-রাও সহজে বুঝবেন।",
    rating: 4.9,
    price: "৳৪৯০/mo",
    freeTrial: true,
    beginnerFriendly: true,
    topPick: true,
    badge: "🏆 Top Pick",
    url: "#",
    initials: "Rs",
    color: "from-cyan-500 to-blue-500",
    commission: "Own Product",
  },
  {
    slug: "ubersuggest",
    name: "Ubersuggest",
    category: "keyword",
    tagline: "Easy keyword discovery",
    benefit: "Long-tail keyword + content ideas এক ক্লিকে।",
    whyRecommend: "Bangla keyword data-ও দেয় — local SEO-র জন্য কাজে লাগে।",
    beginnerNote: "Free tier দিয়েই অনেক কাজ চলে যায়।",
    rating: 4.5,
    price: "$12/mo",
    freeTrial: true,
    beginnerFriendly: true,
    badge: "Alternative",
    url: "#",
    initials: "Ub",
    color: "from-amber-500 to-orange-500",
    commission: "30%",
  },
  {
    slug: "keyword-tool-io",
    name: "Keyword Tool io",
    category: "keyword",
    tagline: "Multi-platform keyword data",
    benefit: "Google + YouTube + Amazon + Bing — সব platform-এর keyword এক জায়গায়।",
    whyRecommend: "YouTube affiliate করলে এর alternative নেই।",
    beginnerNote: "Free version-এ keyword দেখায় কিন্তু volume দেখাতে pro লাগে।",
    rating: 4.5,
    price: "$69/mo",
    freeTrial: true,
    beginnerFriendly: true,
    url: "#",
    initials: "Kt",
    color: "from-cyan-500 to-blue-500",
    commission: "30%",
  },
  {
    slug: "kwfinder",
    name: "KWFinder",
    category: "keyword",
    tagline: "Difficulty score পেতে সবচেয়ে accurate",
    benefit: "Low competition keyword খোঁজার জন্য specifically built।",
    whyRecommend: "Difficulty score color-coded — দেখলেই বোঝা যায় rank করা সম্ভব কিনা।",
    beginnerNote: "Beginner-friendly UI ও ১০ দিন free trial।",
    rating: 4.6,
    price: "$29/mo",
    freeTrial: true,
    beginnerFriendly: true,
    url: "#",
    initials: "Kw",
    color: "from-purple-500 to-violet-500",
    commission: "30%",
  },

  // ─── EMAIL ───
  {
    slug: "cloudoora-email",
    name: "Cloudoora Email Hosting",
    category: "email",
    tagline: "Professional email hosting + marketing by Cloudoora",
    benefit: "Custom domain email, Bangla template, drag-drop builder ও affiliate-friendly automation — সব এক subscription-এ।",
    whyRecommend: "আমাদের নিজেদের Cloudoora email hosting — local payment, Bangla support ও spam-free delivery।",
    beginnerNote: "প্রথম ৫০০ subscriber free, কোনো credit card লাগে না।",
    rating: 4.9,
    price: "৳৫৯০/mo",
    freeTrial: true,
    beginnerFriendly: true,
    topPick: true,
    badge: "🏆 Top Pick",
    url: "#",
    initials: "Cd",
    color: "from-emerald-500 to-teal-500",
    commission: "Own Product",
  },
  {
    slug: "getresponse",
    name: "GetResponse",
    category: "email",
    tagline: "All-in-one marketing automation",
    benefit: "Email + landing page + funnel builder এক subscription-এ।",
    whyRecommend: "Affiliate funnel build করার জন্য সবচেয়ে complete tool।",
    beginnerNote: "৩০ দিন free trial credit card ছাড়া।",
    rating: 4.6,
    price: "$15.58/mo",
    freeTrial: true,
    beginnerFriendly: true,
    badge: "Alternative",
    url: "#",
    initials: "Gr",
    color: "from-emerald-500 to-teal-500",
    commission: "33% recurring",
  },
  {
    slug: "mailchimp",
    name: "Mailchimp",
    category: "email",
    tagline: "Free up to 500 subscribers",
    benefit: "শুরুতে ০ টাকায় email marketing শুরু করতে পারবেন।",
    whyRecommend: "একদম beginner ও tight budget-এর জন্য নিরাপদ choice।",
    beginnerNote: "Drag-and-drop email builder খুব সহজ।",
    rating: 4.4,
    price: "Free–$13",
    freeTrial: true,
    beginnerFriendly: true,
    badge: "Free Plan",
    url: "#",
    initials: "Mc",
    color: "from-yellow-500 to-amber-500",
    commission: "Referral $30",
  },
  {
    slug: "convertkit",
    name: "ConvertKit",
    category: "email",
    tagline: "Creator-first platform",
    benefit: "Tag-based subscriber management — advanced segmentation সহজ।",
    whyRecommend: "Blogger ও content creator-দের জন্য ideal।",
    beginnerNote: "Visual automation builder — flow design করা মজার।",
    rating: 4.7,
    price: "Free–$29",
    freeTrial: true,
    beginnerFriendly: true,
    url: "#",
    initials: "Ck",
    color: "from-pink-500 to-rose-500",
    commission: "30% recurring",
  },
];

export const getToolsByCategory = (cat: ToolCategory) => tools.filter((t) => t.category === cat);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
