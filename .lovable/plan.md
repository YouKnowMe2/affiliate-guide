# Plan: WordPress + ACF as Headless CMS for Affiliate Guidance

Use WordPress as the source of truth for posts, tools, and category content. The React app fetches data through a secure Supabase Edge Function that proxies the WordPress REST API (with ACF fields exposed). This replaces the static `src/data/posts.ts` and `src/data/tools.ts` arrays.

## Architecture

```text
React app  →  Edge Function (wp-content)  →  WordPress REST API (+ ACF)
            (Lovable Cloud, secrets)        /wp-json/wp/v2/...
                                            /wp-json/acf/v3/...
```

Two supported WordPress sources — pick one:
- **WordPress.com site** → use the existing Lovable WordPress.com connector (gateway handles auth, no API key needed in your WP install). ACF works on Business plan and above.
- **Self-hosted WordPress** → call your site directly (e.g. `https://cms.yoursite.com/wp-json/...`). Requires installing ACF + ACF to REST API plugin and (for writes/private content) JWT or Application Passwords.

Ask the user which one they're using; the edge function shape is the same, only the base URL + auth header differ.

## Content Model in WordPress

Configure these in WP admin:

1. **Custom Post Types** (via CPT UI plugin or code):
   - `post` (built-in) → blog articles
   - `tool` → affiliate tool entries
   - `tool_category` → hosting / seo / keyword / email landing pages

2. **ACF Field Groups**:
   - **Post fields**: `content_type` (select: Informational/Commercial/Comparison/Tutorial), `read_time`, `monetization` (select: hosting/seo/keyword/email), `bangla_excerpt`
   - **Tool fields**: `tagline`, `price`, `rating`, `pros` (repeater), `cons` (repeater), `affiliate_url`, `is_top_pick` (true/false), `category` (relationship to tool_category), `color_gradient`, `initials`
   - **Tool Category fields**: `hero_headline_bn`, `cta_text`, `top_pick` (relationship to tool), `comparison_rows` (repeater), `faqs` (repeater)

3. **Expose ACF in REST**: Self-hosted needs the *ACF to REST API* plugin (or set `show_in_rest => true` on each field group). WordPress.com Business+ exposes ACF automatically via `/wp/v2/posts/{id}?_fields=acf`.

## Frontend Integration

1. **New edge function** `supabase/functions/wp-content/index.ts`
   - Routes: `?resource=posts`, `?resource=post&slug=...`, `?resource=tools`, `?resource=tool-category&slug=hosting`
   - Calls WordPress REST via the gateway (WP.com) or direct fetch + Application Password (self-hosted)
   - Normalizes WP response → matches existing `Post` / `Tool` / `ToolCategory` TypeScript types so UI doesn't change
   - Sets `Cache-Control: public, max-age=300` for ISR-like caching
   - Validates query params with Zod

2. **Data layer** `src/lib/cms.ts`
   - `fetchPosts()`, `fetchPost(slug)`, `fetchTools()`, `fetchToolsByCategory(cat)`, `fetchToolCategory(slug)`
   - All wrapped in React Query hooks: `usePosts()`, `usePost(slug)`, etc.

3. **Page refactors** (swap static imports for hooks, keep all current UI/markup):
   - `src/pages/Blog.tsx` → `usePosts()`
   - `src/pages/BlogPost.tsx` → `usePost(slug)`
   - `src/pages/Tools.tsx`, `ToolCategory.tsx`, `ToolDetail.tsx` → matching hooks
   - `src/pages/Home.tsx` (FeaturedGuides, BestTools, FeaturedRecommendations) → hooks with loading skeletons
   - Keep `src/data/posts.ts` & `tools.ts` temporarily as fallback/seed; remove once WP is populated

4. **Loading & error states**: skeleton cards reusing existing `card-premium` styling; error fallback shows a friendly message + link to `/tools`.

5. **SEO**: Since this stays a Vite SPA, add per-page `<title>` and meta tags via a small `useSeo()` hook that updates `document.head` from CMS data.

## Required Secrets / Setup

Depending on the choice above, after the plan is approved I will:
- **WordPress.com**: trigger the WordPress.com connector picker (no manual keys).
- **Self-hosted**: ask for `WP_BASE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` (Application Password from WP admin → Users → Profile) and store via the secrets tool.

Lovable Cloud must be enabled for the edge function and secrets — I'll prompt for that before deploying.

## Out of Scope (can be added later)

- Writing back to WordPress from the app
- Webhook-driven cache invalidation
- Multi-language (Polylang/WPML) routing
- Preview mode for unpublished drafts

## Open Questions

1. WordPress.com or self-hosted WordPress?
2. Should we delete the static `posts.ts` / `tools.ts` immediately, or keep as fallback during migration?
3. Do you want the homepage's "Featured Recommendations" (Cloudoora, Ranksuite) editable from WP too, or stay hardcoded as proprietary brand content?
