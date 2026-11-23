import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { usePages, useWpSearch } from "@/lib/cms";
import { getTemplateBySlug } from "@/pages/wp/pageTemplates";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface NavNodeLite { label: string; to: string }

interface Props {
  menuItems: NavNodeLite[];
  variant?: "desktop" | "mobile";
  onPick?: () => void;
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();
const norm = (s: string) => s.toLowerCase().normalize("NFKD");

type Result = { key: string; title: string; to: string; kind: "menu" | "page" | "post" | "wp" };

const MenuSearch = ({ menuItems, variant = "desktop", onPick }: Props) => {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [expanded, setExpanded] = useState(variant === "mobile");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: pages = [] } = usePages();

  const isMobile = variant === "mobile";

  // Debounce the query before hitting WP REST
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(id);
  }, [q]);

  const { data: wpHits = [], isFetching: wpLoading } = useWpSearch(debounced);

  // Local fallback results (menu items + known pages) — show instantly while WP loads
  const localAll = useMemo<Result[]>(() => {
    const fromPages: Result[] = pages.map((p) => {
      const tpl = getTemplateBySlug(p.slug);
      return {
        key: `page-${p.slug}`,
        title: stripHtml(p.title) || p.slug,
        to: tpl?.path ?? `/p/${p.slug}`,
        kind: "page",
      };
    });
    const fromMenu: Result[] = menuItems.map((m, i) => ({
      key: `menu-${i}-${m.to}`,
      title: m.label,
      to: m.to,
      kind: "menu",
    }));
    const seen = new Set<string>();
    return [...fromMenu, ...fromPages].filter((r) => {
      if (seen.has(r.to)) return false;
      seen.add(r.to);
      return true;
    });
  }, [pages, menuItems]);

  const results = useMemo<Result[]>(() => {
    const t = q.trim();
    if (!t) return [];
    const n = norm(t);

    const wpResults: Result[] = wpHits.map((h) => {
      // Map WP subtype → local SPA route
      let to = h.path;
      if (h.subtype === "post" && h.slug) to = `/${h.slug}`;
      else if (h.subtype === "page" && h.slug) {
        const tpl = getTemplateBySlug(h.slug);
        to = tpl?.path ?? `/p/${h.slug}`;
      }
      return {
        key: `wp-${h.id}`,
        title: h.title || h.slug,
        to,
        kind: h.subtype === "post" ? "post" : "wp",
      };
    });

    const local = localAll.filter((r) => norm(r.title).includes(n));

    // Merge — WP first, then local; dedupe by `to`
    const seen = new Set<string>();
    return [...wpResults, ...local].filter((r) => {
      if (seen.has(r.to)) return false;
      seen.add(r.to);
      return true;
    }).slice(0, 10);
  }, [q, wpHits, localAll]);

  useEffect(() => setActive(0), [q]);

  // Debounced search_query tracking — fires ~600ms after the user stops typing
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) return;
    const id = window.setTimeout(() => {
      track("search_query", { source: variant, query: t, results: results.length });
    }, 600);
    return () => window.clearTimeout(id);
  }, [q, results.length, variant]);

  // Close on outside click (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isMobile]);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setExpanded(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile]);

  const openSearch = () => {
    setExpanded(true);
    track("search_open", { source: variant });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const pick = (r: Result) => {
    track("search_select", { source: variant, query: q.trim(), title: r.title, target: r.to });
    setQ("");
    if (!isMobile) setExpanded(false);
    onPick?.();
    if (r.to.startsWith("http")) window.open(r.to, "_blank", "noopener");
    else navigate(r.to);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[active]; if (r) pick(r); }
    else if (e.key === "Escape") {
      if (!isMobile) { setExpanded(false); setQ(""); }
      inputRef.current?.blur();
    }
  };

  // Desktop collapsed → icon only
  if (!isMobile && !expanded) {
    return (
      <button
        type="button"
        onClick={openSearch}
        aria-label="Open search"
        className="grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", isMobile ? "w-full" : "w-64")}>
      <div className={cn(
        "flex items-center gap-2 border-b border-border transition-colors",
        "focus-within:border-foreground",
        isMobile ? "py-2" : "py-1.5",
      )}>
        {wpLoading && q.trim().length >= 2 ? (
          <Loader2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="খুঁজুন…"
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none font-bangla"
          aria-label="Search"
        />
        {(q || !isMobile) && (
          <button
            type="button"
            onClick={() => {
              if (q) {
                setQ("");
                inputRef.current?.focus();
              } else if (!isMobile) {
                setExpanded(false);
              }
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label={q ? "Clear" : "Close"}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {q && results.length > 0 && (
        <div className={cn(
          "z-50 mt-1 bg-popover border border-border rounded-lg shadow-premium-md overflow-hidden",
          isMobile ? "relative" : "absolute right-0 w-72",
        )}>
          <ul role="listbox" className="py-1 max-h-72 overflow-y-auto">
            {results.map((r, i) => (
              <li key={r.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(r)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-sm font-bangla truncate",
                    i === active ? "bg-primary/10 text-foreground" : "text-foreground/80 hover:bg-secondary",
                  )}
                >
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {q && results.length === 0 && (
        <div className={cn(
          "z-50 mt-1 bg-popover border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground",
          isMobile ? "relative" : "absolute right-0 w-72",
        )}>
          কিছু পাওয়া যায়নি
        </div>
      )}
    </div>
  );
};

export default MenuSearch;
