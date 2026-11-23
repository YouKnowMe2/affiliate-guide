import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Tools from "./pages/Tools.tsx";
import ToolCategory from "./pages/ToolCategory.tsx";
import ToolDetail from "./pages/ToolDetail.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import Sitemap from "./pages/Sitemap.tsx";
import Categories from "./pages/Categories.tsx";
import Category from "./pages/Category.tsx";
import Tag from "./pages/Tag.tsx";
import GuestPost from "./pages/GuestPost.tsx";
import Sponsored from "./pages/Sponsored.tsx";
import ClearCache from "./pages/ClearCache.tsx";
import WPPageTemplate from "./pages/wp/WPPageTemplate.tsx";
import { PAGE_TEMPLATES } from "./pages/wp/pageTemplates.ts";
import { track } from "@/lib/analytics";
import { bootstrapConsent } from "@/lib/consent";
import { setupRevalidationListener } from "@/lib/revalidation";

// Re-load analytics if the user has previously granted consent (no-op otherwise).
bootstrapConsent();

// Wire up on-demand revalidation: clears cache instantly when WordPress
// pings the wp-revalidate edge function on publish/update.
if (typeof window !== "undefined") {
  void setupRevalidationListener(queryClient);
}

/** Global delegated click listener for `data-analytics` attributes — needed
 *  for HTML injected via dangerouslySetInnerHTML (CTA cards, related links). */
const useGlobalAnalytics = () => {
  const location = useLocation();
  useEffect(() => {
    track("page_view", { path: location.pathname + location.search });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const el = t?.closest?.("[data-analytics]") as HTMLElement | null;
      if (!el) return;
      const event = el.getAttribute("data-analytics");
      if (event === "cta-click") {
        track("cta_click", {
          source: el.getAttribute("data-cta-source") || "inline",
          variant: el.getAttribute("data-cta-variant") || undefined,
          label: el.getAttribute("data-cta-label") || el.textContent?.trim().slice(0, 80),
          target: (el as HTMLAnchorElement).getAttribute("href") || undefined,
        });
      } else if (event === "related-click") {
        track("cta_click", {
          source: "related-card",
          target: el.getAttribute("data-related-target") || (el as HTMLAnchorElement).getAttribute("href") || undefined,
          label: el.textContent?.trim().slice(0, 80),
        });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
};

const AnalyticsBridge = () => {
  useGlobalAnalytics();
  return null;
};

/** Legacy /blog/:slug → /:slug redirect (preserves SEO for old URLs). */
const LegacyBlogPostRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/${slug ?? ""}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsBridge />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<LegacyBlogPostRedirect />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/:category" element={<ToolCategory />} />
            <Route path="/tools/:category/:slug" element={<ToolDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/tag/:slug" element={<Tag />} />
            <Route path="/guest-post" element={<GuestPost />} />
            <Route path="/sponsored" element={<Sponsored />} />
            <Route path="/clear-cache" element={<ClearCache />} />
            {PAGE_TEMPLATES.map((t) => (
              <Route
                key={t.slug}
                path={t.path}
                element={<WPPageTemplate slug={t.slug} template={t} />}
              />
            ))}
            <Route path="/p/:slug" element={<WPPageTemplate />} />
            <Route path="/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
