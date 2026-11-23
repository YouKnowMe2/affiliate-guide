import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Compass, Rocket, Target, Trophy } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { usePosts, usePostCategories, type PostWithCategories } from "@/lib/cms";
import { sanitizeTitle } from "@/lib/sanitize";

const ICONS = [Compass, Rocket, Target, BookOpen, Trophy];
const GRADIENTS = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-pink-500 via-rose-500 to-orange-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-red-500",
];

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

const FeaturedCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { data: posts = [] } = usePosts();
  const { data: wpCategories = [] } = usePostCategories();

  const guides = useMemo(() => {
    const featuredCat = wpCategories.find(
      (c) => c.slug.toLowerCase() === "featured" || c.name.toLowerCase() === "featured",
    );
    const featuredId = featuredCat?.id;
    const filtered = (posts as PostWithCategories[]).filter((p) =>
      featuredId
        ? (p.categoryIds ?? []).includes(featuredId)
        : (p.category ?? "").toLowerCase() === "featured",
    );
    return filtered.slice(0, 8).map((p, i) => ({
      key: p.slug,
      eyebrow: featuredCat?.name?.toUpperCase() ?? "FEATURED",
      title: stripHtml(p.title),
      titleHtml: sanitizeTitle(p.title),
      desc: stripHtml(p.excerpt ?? ""),
      cta: "📘 পুরো Guide পড়ুন",
      to: `/${p.slug}`,
      icon: ICONS[i % ICONS.length],
      gradient: GRADIENTS[i % GRADIENTS.length],
      stat: p.readTime ?? "৫ মিনিট পড়া",
      image: p.image,
    }));
  }, [posts, wpCategories]);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!guides.length) return null;

  return (
    <section className="section-pad bg-surface relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-30" />
      <div className="container-app">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="h-3 w-3" /> FEATURED GUIDES
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight font-bangla">
              Beginner-দের জন্য <span className="gradient-text">হাত-ধরে-শেখার</span> গাইড
            </h2>
            <p className="mt-3 text-muted-foreground font-bangla">
              এই {guides.length}টি গাইড পড়লেই আপনি আজই affiliate marketing শুরু করতে পারবেন।
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{current + 1}</span>
            <span>/ {guides.length}</span>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 5500, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {guides.map((g) => (
              <CarouselItem
                key={g.key}
                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
              >
                <article className="card-premium overflow-hidden h-full flex flex-col group">
                  <div
                    className={`relative aspect-[16/9] bg-gradient-to-br ${g.gradient} p-6 flex flex-col justify-between text-white overflow-hidden`}
                  >
                    {g.image && (
                      <img
                        src={g.image}
                        alt={g.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                    <div className="relative flex items-start justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur grid place-items-center group-hover:scale-110 transition-transform">
                        <g.icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur font-semibold">
                        {g.eyebrow}
                      </span>
                    </div>
                    <div className="relative text-xs opacity-90">⏱ {g.stat}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="font-display text-lg md:text-xl font-bold leading-snug font-bangla group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: g.titleHtml }}
                    />
                    {g.desc && (
                      <p className="mt-3 text-sm text-muted-foreground font-bangla flex-1 line-clamp-3">
                        {g.desc}
                      </p>
                    )}
                    <Button variant="cta" className="mt-5 w-full" asChild>
                      <Link to={g.to}>
                        {g.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </div>
        </Carousel>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {guides.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
