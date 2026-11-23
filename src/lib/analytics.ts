/**
 * Lightweight analytics layer.
 *
 * Goals:
 *  - Zero external SDK required: events flow into `window.dataLayer` (so any
 *    GTM / GA4 / Plausible bridge will pick them up automatically when added).
 *  - Persistent local log (capped) so you can audit recent events from the
 *    browser console: `localStorage.getItem("ag.analytics")`.
 *  - One stable API used by every funnel surface (CTA / Search / Forms).
 */

export type AnalyticsEvent =
  | "cta_click"
  | "search_open"
  | "search_query"
  | "search_select"
  | "contact_submit_attempt"
  | "contact_submit_success"
  | "contact_submit_error"
  | "guest_post_submit_attempt"
  | "guest_post_submit_success"
  | "guest_post_submit_error"
  | "sponsored_submit_attempt"
  | "sponsored_submit_success"
  | "sponsored_submit_error"
  | "page_view";

export interface AnalyticsPayload {
  /** Where in the UI the event fired (e.g. "header", "inline-prose", "footer"). */
  source?: string;
  /** Additional event-specific data — kept flat for easy GA4 mapping. */
  [k: string]: unknown;
}

interface StoredEvent {
  event: AnalyticsEvent;
  ts: number;
  path: string;
  payload: AnalyticsPayload;
}

const STORAGE_KEY = "ag.analytics";
const MAX_STORED = 200;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics 4 from `VITE_GA_MEASUREMENT_ID` (e.g. "G-XXXXXXX").
 * Safe to call multiple times — only injects the gtag.js snippet once.
 * Skipped automatically when the env var is missing.
 */
export function initGA() {
  if (typeof window === "undefined") return;
  const id =
    (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() ||
    "G-Y57BMG60DG";
  if (!id) return;
  if ((window as unknown as { __agGAReady?: boolean }).__agGAReady) return;
  (window as unknown as { __agGAReady?: boolean }).__agGAReady = true;

  window.dataLayer = window.dataLayer || [];
  // If the inline gtag from index.html already exists, reuse it. Otherwise
  // define one and inject the gtag.js loader.
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      // gtag uses `arguments` (array-like) — push as-is so Google's snippet
      // can parse the queued calls once gtag.js loads.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.dataLayer!.push(arguments as any);
    };

    // ===== Google Consent Mode v2 — advanced =====
    // Set DENIED defaults BEFORE the gtag.js loader so cookieless pings
    // (and AI-modelled conversions) are used until the user grants consent.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });
    // Enable URL passthrough + redact ads data so no PII leaks while denied.
    window.gtag("set", "url_passthrough", true);
    window.gtag("set", "ads_data_redaction", true);

    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
  }
}

/**
 * Update Google Consent Mode signals after the user makes a choice.
 * Safe to call before or after gtag.js has loaded (queued via dataLayer).
 */
export function updateConsentMode(granted: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const v = granted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
}

const safeStorage = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

const persist = (entry: StoredEvent) => {
  const ls = safeStorage();
  if (!ls) return;
  try {
    const raw = ls.getItem(STORAGE_KEY);
    const list: StoredEvent[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    if (list.length > MAX_STORED) list.splice(0, list.length - MAX_STORED);
    ls.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / parse errors
  }
};

/** Fire an analytics event. Safe to call from any environment. */
export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const entry: StoredEvent = {
    event,
    ts: Date.now(),
    path: window.location.pathname + window.location.search,
    payload,
  };

  // 1. dataLayer (GTM-compatible)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload, page_path: entry.path });

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      if (event === "page_view") {
        window.gtag("event", "page_view", { page_path: entry.path, ...payload });
      } else {
        window.gtag("event", event, { page_path: entry.path, ...payload });
      }
    } catch {
      /* ignore */
    }
  }

  // 3. Plausible (if installed)
  if (typeof window.plausible === "function") {
    try {
      window.plausible(event, { props: payload as Record<string, unknown> });
    } catch {
      /* ignore */
    }
  }

  // 3. Persistent local log for debugging / offline review
  persist(entry);

  // 4. Dev console echo
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, payload);
  }
}

/** Read the recent local log (most recent last). */
export function getRecentEvents(): StoredEvent[] {
  const ls = safeStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Reset the local event log. */
export function clearEvents() {
  const ls = safeStorage();
  ls?.removeItem(STORAGE_KEY);
}
