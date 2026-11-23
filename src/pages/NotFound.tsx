import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, BookOpen, Wrench, Mail, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const QUICK_LINKS = [
  { to: "/", label: "Home", icon: Home, desc: "Affiliate Guidance হোমপেজে ফিরে যান" },
  { to: "/blog", label: "Blog", icon: BookOpen, desc: "সব ব্লগ পোস্ট পড়ুন" },
  { to: "/tools", label: "Tools", icon: Wrench, desc: "Recommended affiliate tools" },
  { to: "/contact", label: "Contact", icon: Mail, desc: "প্রশ্ন থাকলে যোগাযোগ করুন" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="404 — Page Not Found · Affiliate Guidance"
        description="আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি। হোম পেজে ফিরে যান বা আমাদের ব্লগ ও টুলস ব্রাউজ করুন।"
        canonical={location.pathname}
        robots="noindex,follow"
      />
      <section className="container-app py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Error 404
          </p>
          <h1 className="mt-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-6xl font-black tracking-tight text-transparent md:text-8xl">
            পেজটি খুঁজে পাইনি
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            দুঃখিত! আপনি যে লিংকটি ভিজিট করতে চাচ্ছেন সেটি সরানো হয়েছে, নাম পরিবর্তন হয়েছে, অথবা কখনও existed-ই ছিল না।
          </p>
          <code className="mt-4 inline-block rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
            {location.pathname}
          </code>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> হোমে ফিরে যান
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/sitemap">
                <Search className="mr-2 h-4 w-4" /> Sitemap দেখুন
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">{label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default NotFound;
