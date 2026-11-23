import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let siteKeyPromise: Promise<string> | null = null;
let scriptPromise: Promise<void> | null = null;

async function getSiteKey(): Promise<string> {
  if (!siteKeyPromise) {
    siteKeyPromise = (async () => {
      const { data, error } = await supabase.functions.invoke("recaptcha-config");
      if (error) throw error;
      const key = (data as { siteKey?: string })?.siteKey || "";
      if (!key) throw new Error("reCAPTCHA site key not configured");
      return key;
    })();
  }
  return siteKeyPromise;
}

function loadScript(siteKey: string): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.grecaptcha) return resolve();
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function ensureRecaptcha(): Promise<void> {
  const key = await getSiteKey();
  await loadScript(key);
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const key = await getSiteKey();
  await loadScript(key);
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) return reject(new Error("reCAPTCHA not ready"));
    window.grecaptcha.ready(() => {
      window
        .grecaptcha!.execute(key, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}
