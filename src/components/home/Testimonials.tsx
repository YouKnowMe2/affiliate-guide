import { Star, Shield, Award, Users, TrendingUp, BadgeCheck } from "lucide-react";
import { useTestimonials, type Testimonial } from "@/lib/cms";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback list — used when no WordPress `testimonial` posts exist yet.
 * Edit testimonials from WordPress admin (CPT: "Testimonial" with ACF fields:
 * quote, name, role, rating, initials, color_gradient, avatar, verified).
 */
const SEED: Testimonial[] = [
  {
    id: -1,
    name: "Rakib Hasan",
    role: "Beginner Blogger",
    quote:
      "এই গাইড follow করে ৩ মাসেই আমার প্রথম $৫০ commission পেয়েছি। Step-by-step explanation একদম clear ছিল।",
    rating: 5,
    initials: "RH",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    id: -2,
    name: "Tasnim Akter",
    role: "Affiliate Marketer",
    quote:
      "Hosting ও SEO tools-এর honest review পেয়ে অনেক টাকা সেভ হয়েছে। Shawon ভাই-এর recommendation সত্যিই trustworthy।",
    rating: 5,
    initials: "TA",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: -3,
    name: "Mahmud Rahman",
    role: "Tech YouTuber",
    quote:
      "বাংলায় এত detail-এ affiliate marketing শেখার আর কোনো platform পাইনি। Beginners-দের জন্য must-read।",
    rating: 5,
    initials: "MR",
    color: "from-emerald-500 to-teal-500",
  },
];

const trustBadges = [
  { icon: Users, label: "১০,০০০+ Students", sub: "শিখেছেন আমাদের কাছে" },
  { icon: Star, label: "4.9/5 Rating", sub: "২,৪০০+ পাঠকের রেটিং" },
  { icon: Shield, label: "100% Honest", sub: "Personally tested tools" },
  { icon: TrendingUp, label: "$৫০K+ Earned", sub: "Real, verifiable income" },
  { icon: Award, label: "৫+ বছর", sub: "Industry Experience" },
  { icon: BadgeCheck, label: "Updated 2026", sub: "Latest strategies" },
];

const Testimonials = () => {
  const { data, isLoading } = useTestimonials();
  const items = data && data.length ? data : SEED;

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-30" />
      <div className="container-app">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-3">
            <BadgeCheck className="h-3 w-3" /> SOCIAL PROOF
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
            ১০,০০০+ পাঠক <span className="gradient-text">আস্থা রেখেছেন</span>
          </h2>
          <p className="mt-4 text-muted-foreground font-bangla">
            আমাদের গাইড follow করে যারা সত্যিকার ফল পেয়েছেন।
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {isLoading && !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))
            : items.slice(0, 6).map((t) => (
                <article key={t.id} className="card-premium p-6 flex flex-col relative">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: Math.max(0, Math.min(5, t.rating || 5)) }).map(
                      (_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ),
                    )}
                  </div>
                  <blockquote className="text-foreground/85 font-bangla leading-relaxed text-[15px] flex-1">
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`h-11 w-11 rounded-full bg-gradient-to-br ${
                          t.color || "from-violet-500 to-fuchsia-500"
                        } grid place-items-center text-white font-bold text-sm shrink-0`}
                      >
                        {t.initials}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                    {t.verified !== false && (
                      <BadgeCheck
                        className="h-4 w-4 text-primary ml-auto"
                        aria-label="Verified reader"
                      />
                    )}
                  </div>
                </article>
              ))}
        </div>

        {/* Trust Badges */}
        <div className="rounded-3xl glass border border-border p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {trustBadges.map((b) => (
              <div key={b.label} className="text-center group">
                <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 grid place-items-center mb-3 group-hover:scale-110 transition-transform">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-display font-bold text-sm md:text-base">{b.label}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground font-bangla mt-0.5">
                  {b.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
