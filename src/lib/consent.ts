/**
 * Cookie consent helpers — gate analytics scripts behind explicit user choice.
 *
 * Storage shape (localStorage key "ag.cookie-consent"):
 *   {
 *     version: 1,                      // bump to invalidate old consents
 *     status: "granted" | "denied",
 *     timestamp: "2026-05-14T12:34:56.789Z",
 *     purposes: { analytics: boolean, marketing: boolean }
 *   }
 *
 * Older string values ("granted" / "denied") from previous releases are
 * migrated to this shape on read so existing visitors aren't re-prompted.
 */
import { initGA, track, updateConsentMode } from "@/lib/analytics";

const KEY = "ag.cookie-consent";
const EVT = "ag:consent-change";

/**
 * Bump this whenever the set of purposes, analytics vendors, or the
 * privacy policy materially changes. A stored record with a lower
 * version is treated as "unset" and the banner re-appears.
 */
export const CONSENT_VERSION = 1;

export type ConsentStatus = "granted" | "denied";
export type ConsentState = ConsentStatus | "unset";

export type ConsentPurpose = "analytics" | "marketing";

export type ConsentPurposes = Record<ConsentPurpose, boolean>;

export interface ConsentRecord {
  version: number;
  status: ConsentStatus;
  timestamp: string;
  purposes: ConsentPurposes;
}

const DEFAULT_GRANTED_PURPOSES: ConsentPurposes = { analytics: true, marketing: true };
const DEFAULT_DENIED_PURPOSES: ConsentPurposes = { analytics: false, marketing: false };

function readRaw(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;

  // Legacy: plain string "granted" | "denied"
  if (raw === "granted" || raw === "denied") {
    return {
      version: CONSENT_VERSION,
      status: raw,
      timestamp: new Date().toISOString(),
      purposes: raw === "granted" ? DEFAULT_GRANTED_PURPOSES : DEFAULT_DENIED_PURPOSES,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed?.status !== "granted" && parsed?.status !== "denied") return null;
    return {
      version: typeof parsed.version === "number" ? parsed.version : 0,
      status: parsed.status,
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
      purposes: {
        analytics: !!parsed.purposes?.analytics,
        marketing: !!parsed.purposes?.marketing,
      },
    };
  } catch {
    return null;
  }
}

export function getConsentRecord(): ConsentRecord | null {
  const rec = readRaw();
  if (!rec) return null;
  // Outdated version → treat as unset so the banner re-prompts.
  if (rec.version < CONSENT_VERSION) return null;
  return rec;
}

export function getConsent(): ConsentState {
  return getConsentRecord()?.status ?? "unset";
}

export function getPurposes(): ConsentPurposes {
  return getConsentRecord()?.purposes ?? DEFAULT_DENIED_PURPOSES;
}

export function hasPurpose(p: ConsentPurpose): boolean {
  const rec = getConsentRecord();
  return rec?.status === "granted" && !!rec.purposes[p];
}

export function setConsent(status: ConsentStatus, purposes?: Partial<ConsentPurposes>) {
  if (typeof window === "undefined") return;
  const base = status === "granted" ? DEFAULT_GRANTED_PURPOSES : DEFAULT_DENIED_PURPOSES;
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    status,
    timestamp: new Date().toISOString(),
    purposes: { ...base, ...purposes },
  };
  window.localStorage.setItem(KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent(EVT, { detail: record }));
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVT, { detail: null }));
}

export function onConsentChange(cb: (record: ConsentRecord | null) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail as ConsentRecord | null);
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}

/**
 * Detect Do Not Track (DNT) / Global Privacy Control (GPC) signals.
 * Returns true when the browser explicitly requests not to be tracked.
 */
export function hasDNT(): boolean {
  if (typeof window === "undefined") return false;
  // Global Privacy Control (California / newer standard)
  if ((navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true) return true;
  // Navigator doNotTrack: "1" = don't track, "0" = ok to track
  if (navigator.doNotTrack === "1") return true;
  // Legacy window.doNotTrack for older IE/Edge
  if ((window as unknown as { doNotTrack?: string }).doNotTrack === "1") return true;
  return false;
}

let gaBootstrapped = false;
let rankSuiteLoaded = false;

/**
 * Google Consent Mode v2 — advanced.
 *
 * GA4 (gtag.js) is loaded immediately on every visit with DENIED defaults,
 * so no analytics/ads cookies are written. The tag sends cookieless pings
 * that Google uses for AI-modelled traffic & conversion estimates. Once the
 * user grants consent, we flip the consent signals to "granted" so full
 * measurement (with cookies) resumes — no page reload required.
 */
function bootstrapGA() {
  if (typeof window === "undefined" || gaBootstrapped) return;
  gaBootstrapped = true;
  initGA(); // sets DENIED defaults, then loads gtag.js
  track("page_view", { path: window.location.pathname + window.location.search });
}

function loadRankSuite() {
  if (typeof document === "undefined" || rankSuiteLoaded) return;
  if (document.getElementById("rs-embed-tracker")) {
    rankSuiteLoaded = true;
    return;
  }
  rankSuiteLoaded = true;
  const s = document.createElement("script");
  s.id = "rs-embed-tracker";
  s.async = true;
  s.src = "https://dev.affiliateguidance.com/wp-content/plugins/ranksuite/public/js/rs-embed-tracker.js";
  s.dataset.endpoint = "https://dev.affiliateguidance.com/wp-json/ranksuite/v1/analytics/collect";
  s.dataset.token = "8fe4cb8cec3818f9d8ac6ff1d90096613ffa0893068fa448372f94ceb2aee523";
  document.head.appendChild(s);
}

/** Back-compat helper — fully applies the current consent state. */
export function loadAnalytics() {
  bootstrapGA();
  loadRankSuite(); // anonymised, first-party — always on
  updateConsentMode(hasPurpose("analytics"));
}

/**
 * Call once on app start. Loads GA4 immediately with Consent Mode v2
 * DENIED defaults (cookieless pings only) and the first-party RankSuite
 * tracker (anonymised data, no personal identifiers). When the user later
 * grants analytics consent, GA consent signals are flipped to "granted".
 */
export function bootstrapConsent() {
  if (typeof window === "undefined") return;
  bootstrapGA();
  loadRankSuite();
  updateConsentMode(hasPurpose("analytics"));
  onConsentChange((rec) => {
    const granted = rec?.status === "granted" && !!rec.purposes.analytics;
    updateConsentMode(granted);
  });
}
