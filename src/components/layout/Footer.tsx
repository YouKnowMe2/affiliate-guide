import { Link } from "react-router-dom";
import { Sparkles, Mail, Twitter, Youtube, Facebook, ArrowRight } from "lucide-react";
import { usePages, usePostCategories } from "@/lib/cms";
import { PAGE_TEMPLATES } from "@/pages/wp/pageTemplates";
import { useMemo } from "react";

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const Footer = () => {
  const { data: pages = [] } = usePages();
  const { data: postCategories = [] } = usePostCategories();

  /** Group WP pages by template variant for footer columns. */
  const grouped = useMemo(() => {
    const byVariant = new Map<string, { title: string; to: string }[]>();
    pages.forEach((p) => {
      const tpl = PAGE_TEMPLATES.find((t) => t.slug === p.slug);
      if (!tpl) return;
      const list = byVariant.get(tpl.variant) ?? [];
      list.push({ title: stripHtml(p.title) || p.slug, to: tpl.path });
      byVariant.set(tpl.variant, list);
    });
    return byVariant;
  }, [pages]);

  const learnLinks = [
    ...(grouped.get("guide") ?? []),
    ...(grouped.get("tutorial") ?? []),
  ].slice(0, 5);

  const exploreLinks = [
    ...(grouped.get("reviews") ?? []),
    ...(grouped.get("resources") ?? []),
    ...(grouped.get("tools") ?? []),
  ].slice(0, 5);

  const aboutLinks = [
    ...(grouped.get("about") ?? []),
    ...(grouped.get("contact") ?? []),
  ];

  const legalLinks = grouped.get("legal") ?? [];

  return (
    <footer className="relative mt-20 border-t border-border bg-surface">
      <div className="container-app py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Affiliate Guidance logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl shadow-premium-glow"
              />
              <span className="font-display text-lg font-bold">Affiliate Guidance</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              বাংলায় Affiliate Marketing শেখার সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম। শূন্য থেকে আয় শুরু করুন।
            </p>

            <form className="mt-6 max-w-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                ফ্রি স্টার্টার গাইড
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="email@domain.com"
                  className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="h-10 px-4 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5">
                  Send <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            <div className="flex gap-2 mt-6">
              {[Facebook, Youtube, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 grid place-items-center rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="ক্যাটাগরি"
            enTitle="Categories"
            links={postCategories.slice(0, 6).map((c) => ({
              title: c.name,
              to: `/category/${encodeURIComponent(c.slug)}`,
            }))}
            fallback={[
              { title: "সব ক্যাটাগরি", to: "/categories" },
              { title: "ব্লগ", to: "/blog" },
            ]}
          />

          <FooterCol title="এক্সপ্লোর" enTitle="Explore" links={exploreLinks} fallback={[
            { title: "টুলস", to: "/tools" },
            { title: "রিভিউ", to: "/reviews" },
            { title: "রিসোর্স", to: "/resources" },
          ]} />

          <FooterCol
            title="কোম্পানি"
            enTitle="Company"
            links={[
              ...aboutLinks,
              { title: "Write for us", to: "/guest-post" },
              { title: "Sponsored content", to: "/sponsored" },
            ]}
            fallback={[
              { title: "আমাদের সম্পর্কে", to: "/about-us" },
              { title: "যোগাযোগ", to: "/contact" },
              { title: "Write for us", to: "/guest-post" },
              { title: "Sponsored content", to: "/sponsored" },
            ]}
          />
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Affiliate Guidance. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {(legalLinks.length ? legalLinks : [
              { title: "Privacy Policy", to: "/privacy-policy" },
              { title: "Affiliate Disclosure", to: "/affiliate-disclosure" },
            ]).map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-primary transition-colors">
                {l.title}
              </Link>
            ))}
            <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

interface FooterColProps {
  title: string;
  enTitle: string;
  links: { title: string; to: string }[];
  fallback: { title: string; to: string }[];
}

const FooterCol = ({ title, enTitle, links, fallback }: FooterColProps) => {
  const items = links.length ? links : fallback;
  return (
    <div>
      <h4 className="font-semibold mb-4 text-sm tracking-wider">
        <span className="font-bangla">{title}</span>
        <span className="block text-[10px] uppercase text-muted-foreground tracking-[0.2em] mt-0.5">{enTitle}</span>
      </h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="hover:text-primary transition-colors line-clamp-1 font-bangla">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Footer;
