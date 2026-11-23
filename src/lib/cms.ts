/**
 * CMS data layer — fetches normalized content from the `wp-content` edge
 * function. If the WordPress source is unreachable or empty, we fall back to
 * the static seed data in `src/data/*` so the site keeps working.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { posts as seedPosts, type Post } from "@/data/posts";
import {
  tools as seedTools,
  categories as seedCategories,
  type Tool,
  type ToolCategory,
  type ToolCategoryMeta,
} from "@/data/tools";

type Resource =
  | { resource: "posts" }
  | { resource: "post"; slug: string }
  | { resource: "tools"; category?: ToolCategory }
  | { resource: "tool"; slug: string; category: ToolCategory }
  | { resource: "tool-categories" }
  | { resource: "tool-category"; slug: ToolCategory };

export type SEOFields = {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  /** Raw HTML (one or more <script type="application/ld+json">) from
   *  RankSuite's `_ranksuite_schema_head` meta. */
  schemaHead?: string;
};

/** Detects ?noCache=1 in the current URL so callers can force-bypass caches. */
function isNoCacheRequested(): boolean {
  if (typeof window === "undefined") return false;
  const v = new URLSearchParams(window.location.search).get("noCache");
  return v === "1" || v === "true" || v === "yes";
}

async function callWp<T>(params: Resource): Promise<T | null> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && search.set(k, String(v)));

  const noCache = isNoCacheRequested();
  if (noCache) {
    search.set("noCache", "1");
    search.set("_t", String(Date.now())); // unique per call → HTTP cache miss
  }

  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wp-content?${search.toString()}`;
    const res = await fetch(url, {
      cache: noCache ? "no-store" : "default",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[cms] WP fetch failed, using fallback", e);
    return null;
  }
}

/** Appended to React Query keys so a `?noCache=1` page load is treated as a
 *  brand-new query (cache miss) instead of returning persisted data. */
const nc = (): string | undefined =>
  isNoCacheRequested() ? `nc:${Math.floor(Date.now() / 1000)}` : undefined;

// ─────────── posts ───────────

export async function fetchPosts(): Promise<Post[]> {
  const data = await callWp<{ items: Post[] }>({ resource: "posts" });
  if (data?.items?.length) return data.items;
  return seedPosts;
}

export async function fetchPost(slug: string): Promise<Post | null> {
  const data = await callWp<{ item: Post }>({ resource: "post", slug });
  if (data?.item) return data.item;
  return seedPosts.find((p) => p.slug === slug) ?? null;
}

export const usePosts = () =>
  useQuery({ queryKey: ["cms", "posts", nc()], queryFn: fetchPosts, staleTime: 5 * 60 * 1000 });

export const usePost = (slug: string | undefined) =>
  useQuery({
    queryKey: ["cms", "post", slug, nc()],
    queryFn: () => fetchPost(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ─────────── tools ───────────

export async function fetchTools(): Promise<Tool[]> {
  const data = await callWp<{ items: Tool[] }>({ resource: "tools" });
  if (data?.items?.length) return data.items;
  return seedTools;
}

export async function fetchTool(category: ToolCategory, slug: string): Promise<Tool | null> {
  const data = await callWp<{ item: Tool }>({ resource: "tool", category, slug });
  if (data?.item) return data.item;
  return seedTools.find((t) => t.slug === slug && t.category === category) ?? null;
}

export const useTools = () =>
  useQuery({ queryKey: ["cms", "tools", nc()], queryFn: fetchTools, staleTime: 5 * 60 * 1000 });

export const useToolsByCategory = (category: ToolCategory | undefined) => {
  const q = useTools();
  return {
    ...q,
    data: q.data?.filter((t) => t.category === category) ?? [],
  };
};

export const useTool = (category: ToolCategory | undefined, slug: string | undefined) =>
  useQuery({
    queryKey: ["cms", "tool", category, slug, nc()],
    queryFn: () => fetchTool(category as ToolCategory, slug as string),
    enabled: !!category && !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ─────────── categories ───────────

export async function fetchCategories(): Promise<ToolCategoryMeta[]> {
  const data = await callWp<{ items: ToolCategoryMeta[] }>({ resource: "tool-categories" });
  if (data?.items?.length) return data.items;
  return seedCategories;
}

export async function fetchCategory(slug: ToolCategory): Promise<ToolCategoryMeta | null> {
  const data = await callWp<{ item: ToolCategoryMeta }>({ resource: "tool-category", slug });
  if (data?.item) return data.item;
  return seedCategories.find((c) => c.slug === slug) ?? null;
}

export const useCategories = () =>
  useQuery({ queryKey: ["cms", "tool-categories", nc()], queryFn: fetchCategories, staleTime: 10 * 60 * 1000 });

export const useCategory = (slug: ToolCategory | undefined) =>
  useQuery({
    queryKey: ["cms", "tool-category", slug, nc()],
    queryFn: () => fetchCategory(slug as ToolCategory),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

// ─────────── menu ───────────

export type MenuItem = {
  id: number | string;
  label: string;
  to: string;
  en?: string;
  target?: string;
  parent?: number | string;
  order?: number;
};

const seedMenu: MenuItem[] = [
  { id: 1, label: "হোম", to: "/", en: "Home" },
  { id: 2, label: "ব্লগ", to: "/blog", en: "Blog" },
  { id: 3, label: "টুলস", to: "/tools", en: "Tools" },
  { id: 4, label: "আমার সম্পর্কে", to: "/about", en: "About" },
  { id: 5, label: "যোগাযোগ", to: "/contact", en: "Contact" },
];

export async function fetchMenu(slug = "primary"): Promise<MenuItem[]> {
  const data = await callWp<{ items: MenuItem[] }>({ resource: "menu", slug } as any);
  if (data?.items?.length) return data.items;
  return [];
}

export const useMenu = (slug = "primary") =>
  useQuery({
    queryKey: ["cms", "menu", slug, nc()],
    queryFn: () => fetchMenu(slug),
    staleTime: 10 * 60 * 1000,
  });

// ─────────── pages ───────────

export type WPPage = {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image: string | null;
  date: string | null;
  modified: string | null;
  seo?: SEOFields;
};

export async function fetchPage(slug: string): Promise<WPPage | null> {
  const data = await callWp<{ item: WPPage }>({ resource: "page", slug } as any);
  return data?.item ?? null;
}

export const usePage = (slug: string | undefined) =>
  useQuery({
    queryKey: ["cms", "page", slug, nc()],
    queryFn: () => fetchPage(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ─────────── pages list (for search) ───────────

export type WPPageSummary = {
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
};

export async function fetchPages(): Promise<WPPageSummary[]> {
  const data = await callWp<{ items: WPPageSummary[] }>({ resource: "pages" } as any);
  return data?.items ?? [];
}

export const usePages = () =>
  useQuery({
    queryKey: ["cms", "pages", nc()],
    queryFn: fetchPages,
    staleTime: 10 * 60 * 1000,
  });

// ─────────── post categories (WP taxonomy) ───────────

export type PostCategory = {
  id: number;
  slug: string;       // decoded
  rawSlug: string;    // url-encoded as in WP
  name: string;
  description: string;
  count: number;
  parent: number;
  seo?: SEOFields;
};

export type PostWithCategories = Post & { categoryIds?: number[]; tagIds?: number[] };

export async function fetchPostCategories(): Promise<PostCategory[]> {
  const data = await callWp<{ items: PostCategory[] }>({ resource: "post-categories" } as any);
  return data?.items ?? [];
}

export async function fetchPostCategory(
  slug: string,
): Promise<{ item: PostCategory; posts: PostWithCategories[] } | null> {
  const data = await callWp<{ item: PostCategory; posts: PostWithCategories[] }>(
    { resource: "post-category", slug } as any,
  );
  if (!data?.item) return null;
  return data;
}

export const usePostCategories = () =>
  useQuery({
    queryKey: ["cms", "post-categories", nc()],
    queryFn: fetchPostCategories,
    staleTime: 10 * 60 * 1000,
  });

export const usePostCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: ["cms", "post-category", slug, nc()],
    queryFn: () => fetchPostCategory(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ─────────── post tags (WordPress) ───────────

export type PostTag = {
  id: number;
  slug: string;
  rawSlug: string;
  name: string;
  count: number;
  seo?: SEOFields;
};

export async function fetchPostTags(): Promise<PostTag[]> {
  const data = await callWp<{ items: PostTag[] }>({ resource: "post-tags" } as any);
  return data?.items ?? [];
}

export const usePostTags = () =>
  useQuery({
    queryKey: ["cms", "post-tags", nc()],
    queryFn: fetchPostTags,
    staleTime: 10 * 60 * 1000,
  });

export async function fetchPostTag(
  slug: string,
): Promise<{ item: PostTag; posts: PostWithCategories[] } | null> {
  const data = await callWp<{ item: PostTag; posts: PostWithCategories[] }>(
    { resource: "post-tag", slug } as any,
  );
  if (data?.item) return data;
  // Fallback: derive from seed posts using getPostTags()
  const { getPostTags } = await import("@/data/posts");
  const decoded = decodeURIComponent(slug);
  const matched = seedPosts.filter((p) =>
    getPostTags(p).some((t) => t === decoded || t === slug),
  );
  if (!matched.length) return null;
  return {
    item: {
      id: 0,
      slug: decoded,
      rawSlug: slug,
      name: decoded.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count: matched.length,
    },
    posts: matched,
  };
}

export const usePostTag = (slug: string | undefined) =>
  useQuery({
    queryKey: ["cms", "post-tag", slug, nc()],
    queryFn: () => fetchPostTag(slug as string),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ─────────── testimonials (WordPress-managed) ───────────

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
  color: string;
  avatar?: string | null;
  verified?: boolean;
  order?: number;
};

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const data = await callWp<{ items: Testimonial[] }>({ resource: "testimonials" } as any);
  return data?.items ?? [];
}

export const useTestimonials = () =>
  useQuery({
    queryKey: ["cms", "testimonials", nc()],
    queryFn: fetchTestimonials,
    staleTime: 10 * 60 * 1000,
  });

// ─────────── search (WordPress REST /wp/v2/search) ───────────

export type WpSearchItem = {
  id: number;
  title: string;
  url: string;
  path: string;
  slug: string;
  type: string;
  subtype: string;
};

export async function searchWp(q: string): Promise<WpSearchItem[]> {
  if (!q.trim()) return [];
  const data = await callWp<{ items: WpSearchItem[] }>(
    { resource: "search", q } as any,
  );
  return data?.items ?? [];
}

export const useWpSearch = (q: string) =>
  useQuery({
    queryKey: ["cms", "search", q.trim().toLowerCase(), nc()],
    queryFn: () => searchWp(q),
    enabled: q.trim().length >= 2,
    staleTime: 60 * 1000,
  });
