import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, Moon, Sun, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuSearch from "./MenuSearch";

import { useMenu, usePages, usePostCategories, type MenuItem } from "@/lib/cms";

interface NavNode {
  id: string | number;
  to: string;
  label: string;
  en: string;
  target?: string;
  children: NavNode[];
}

/** Build a parent→children tree from the flat WP menu list. */
function buildTree(items: MenuItem[]): NavNode[] {
  const byId = new Map<string, NavNode>();
  items.forEach((m) => {
    byId.set(String(m.id), {
      id: m.id,
      to: m.to,
      label: m.label,
      en: m.en ?? "",
      target: m.target,
      children: [],
    });
  });
  const roots: NavNode[] = [];
  items.forEach((m) => {
    const node = byId.get(String(m.id))!;
    const parentId = m.parent != null ? String(m.parent) : "0";
    if (parentId === "0" || !byId.has(parentId)) {
      roots.push(node);
    } else {
      byId.get(parentId)!.children.push(node);
    }
  });
  return roots;
}

/** Tiny hover-intent hook: opens immediately, closes after a short delay so
 *  users can move the cursor across the gap into the dropdown. */
function useHoverIntent(closeMs = 140) {
  const [open, setOpen] = useState(false);
  const t = useRef<number | null>(null);
  const cancel = () => {
    if (t.current) {
      window.clearTimeout(t.current);
      t.current = null;
    }
  };
  return {
    open,
    setOpen,
    onEnter: () => {
      cancel();
      setOpen(true);
    },
    onLeave: () => {
      cancel();
      t.current = window.setTimeout(() => setOpen(false), closeMs);
    },
    cleanup: cancel,
  };
}

/* ─────────── Desktop top-level item ─────────── */
const DesktopItem = ({ node }: { node: NavNode }) => {
  const hasChildren = node.children.length > 0;
  const { open, setOpen, onEnter, onLeave, cleanup } = useHoverIntent();
  const location = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);

  const isActive =
    location.pathname === node.to ||
    node.children.some((c) => c.to === location.pathname);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      cleanup();
    };
  }, [open, setOpen, cleanup]);

  if (!hasChildren) {
    return (
      <NavLink
        to={node.to}
        end={node.to === "/"}
        target={node.target}
        className={({ isActive }) =>
          cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )
        }
      >
        {node.label}
      </NavLink>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive || open
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary",
        )}
      >
        {node.label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2 min-w-[260px] z-50">
          <div
            role="menu"
            className="glass rounded-2xl p-2 shadow-premium-lg border border-border animate-fade-up"
          >
            {/* The parent link itself, so users can still navigate to it */}
            <NavLink
              to={node.to}
              target={node.target}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-secondary",
                )
              }
            >
              <span>{node.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Overview
              </span>
            </NavLink>
            <div className="my-1 h-px bg-border/60" />
            {node.children.map((child) => (
              <DropdownLeaf key={child.id} node={child} onNavigate={() => setOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** Recursive submenu leaf — opens nested level to the right. */
const DropdownLeaf = ({
  node,
  onNavigate,
}: {
  node: NavNode;
  onNavigate?: () => void;
}) => {
  const hasChildren = node.children.length > 0;
  const { open, setOpen, onEnter, onLeave } = useHoverIntent();

  if (!hasChildren) {
    return (
      <NavLink
        to={node.to}
        target={node.target}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "text-primary bg-primary/10"
              : "text-foreground hover:bg-secondary",
          )
        }
      >
        {node.label}
        {node.en && (
          <span className="ml-1.5 text-[10px] text-muted-foreground">{node.en}</span>
        )}
      </NavLink>
    );
  }

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          open ? "bg-secondary text-primary" : "text-foreground hover:bg-secondary",
        )}
      >
        <span>{node.label}</span>
        <ChevronRight
          className={cn("h-3.5 w-3.5 transition-transform", open && "translate-x-0.5")}
        />
      </button>
      {open && (
        <div className="absolute top-0 left-full pl-2 min-w-[240px] z-50">
          <div
            role="menu"
            className="glass rounded-2xl p-2 shadow-premium-lg border border-border animate-fade-up"
          >
            <NavLink
              to={node.to}
              target={node.target}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "block px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-secondary",
                )
              }
            >
              {node.label}
              <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Overview
              </span>
            </NavLink>
            <div className="my-1 h-px bg-border/60" />
            {node.children.map((child) => (
              <DropdownLeaf key={child.id} node={child} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────── Mobile accordion item (any depth) ─────────── */
const MobileItem = ({
  node,
  depth = 0,
  onNavigate,
}: {
  node: NavNode;
  depth?: number;
  onNavigate?: () => void;
}) => {
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(depth === 0 ? false : false);

  return (
    <div>
      <div className="flex items-center">
        <NavLink
          to={node.to}
          end={node.to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex-1 px-4 py-3 rounded-lg text-sm font-medium",
              isActive ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary",
            )
          }
          style={{ paddingLeft: `${1 + depth * 0.85}rem` }}
        >
          {node.label}
          {node.en && (
            <span className="text-muted-foreground text-xs"> · {node.en}</span>
          )}
        </NavLink>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((x) => !x)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="h-10 w-10 grid place-items-center rounded-lg hover:bg-secondary"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mt-1 border-l border-border ml-4 pl-1 space-y-0.5">
          {node.children.map((c) => (
            <MobileItem
              key={c.id}
              node={c}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────── Header ─────────── */
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const location = useLocation();
  const { data: menuData } = useMenu("primary");
  const { data: pages = [] } = usePages();
  const { data: postCategories = [] } = usePostCategories();

  /** Build the tree strictly from the WP primary menu — no synthetic items. */
  const tree = useMemo<NavNode[]>(
    () => (menuData ? buildTree(menuData) : []),
    [menuData],
  );

  /** Flatten the tree + add all WP pages for the search palette. */
  const flatItems = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; to: string }[] = [];
    const push = (label: string, to: string) => {
      if (!to || seen.has(to)) return;
      seen.add(to);
      out.push({ label, to });
    };
    const walk = (nodes: NavNode[]) => {
      nodes.forEach((n) => {
        push(n.label, n.to);
        if (n.children.length) walk(n.children);
      });
    };
    walk(tree);
    pages.forEach((p) =>
      push(p.title.replace(/<[^>]+>/g, "").trim() || p.slug, `/${p.slug}`),
    );
    postCategories.forEach((c) =>
      push(`${c.name} (ক্যাটাগরি)`, `/category/${encodeURIComponent(c.slug)}`),
    );
    return out;
  }, [tree, pages, postCategories]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="container-app">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 md:px-6 py-3 transition-all duration-300",
            scrolled ? "glass shadow-premium-md" : "bg-transparent",
          )}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Affiliate Guidance logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl shadow-premium-glow group-hover:scale-110 transition-transform"
            />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold tracking-tight">Affiliate Guidance</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Earn · Learn · Grow</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {tree.map((node) => (
              <DesktopItem key={node.id} node={node} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <MenuSearch menuItems={flatItems} variant="desktop" />
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="hidden md:grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              className="lg:hidden grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass rounded-2xl p-3 animate-fade-up max-h-[80vh] overflow-y-auto">
            <div className="mb-3">
              <MenuSearch
                menuItems={flatItems}
                variant="mobile"
                onPick={() => setOpen(false)}
              />
            </div>
            {tree.map((node) => (
              <MobileItem key={node.id} node={node} onNavigate={() => setOpen(false)} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
