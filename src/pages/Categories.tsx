import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { usePostCategories } from "@/lib/cms";
import SEO from "@/components/SEO";

const Categories = () => {
  const { data: categories = [], isLoading } = usePostCategories();

  return (
    <>
      <SEO
        title="ক্যাটাগরি — Affiliate Guidance"
        description="ধাপে ধাপে এফিলিয়েট মার্কেটিং শিখুন — শুরু করার গাইড থেকে কেস স্টাডি, রিভিউ ও টুলস পর্যন্ত। সব ক্যাটাগরি এক জায়গায়।"
        canonical="/categories"
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <BookOpen className="h-3.5 w-3.5" /> CATEGORIES
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            সব <span className="gradient-text">ক্যাটাগরি</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto font-bangla">
            ধাপে ধাপে এফিলিয়েট মার্কেটিং শিখুন — শুরু করার গাইড থেকে কেস স্টাডি, রিভিউ ও টুলস পর্যন্ত।
          </p>
        </div>
      </section>

      <section className="container-app pb-20">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">লোড হচ্ছে…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/category/${encodeURIComponent(c.slug)}`}
                className="card-premium p-6 group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {c.count} পোস্ট
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-display text-xl font-bold font-bangla group-hover:text-primary transition-colors">
                  {c.name}
                </h2>
                {c.description && (
                  <p className="mt-2 text-sm text-muted-foreground font-bangla line-clamp-2">
                    {c.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Categories;
