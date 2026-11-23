import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-expect-error — .mjs has no type declarations
import { generateSitemap } from "./scripts/generate-sitemap.mjs";

/** Generates public/sitemap.xml on dev startup and at build time
 *  so the file is served at the site root (/sitemap.xml). */
function sitemapPlugin(): Plugin {
  let triggered = false;
  const run = (silent = false) =>
    generateSitemap({ silent }).catch((e: unknown) => {
      console.warn("[sitemap] generation failed:", (e as Error)?.message || e);
    });
  return {
    name: "ag-sitemap",
    apply: () => true,
    configResolved() {
      if (triggered) return;
      triggered = true;
      // Fire-and-forget; never block startup.
      void run(false);
    },
    closeBundle() {
      // Re-run after build to ensure dist/ has the latest sitemap.
      return run(true);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    sitemapPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
