import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, type ConsentState } from "@/lib/consent";

const CookieConsent = () => {
  const [state, setState] = useState<ConsentState>("unset");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setState(getConsent());
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  if (state !== "unset") return null;

  const choose = (v: "granted" | "denied") => {
    setConsent(v);
    setState(v);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-3 left-3 right-3 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100] glass border border-border rounded-2xl shadow-premium-lg p-4 md:p-5 animate-fade-up pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 grid place-items-center">
          <Cookie className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-base font-semibold mb-1">
            Your privacy choices
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use strictly necessary cookies to run this site. We also use{" "}
            <strong>Google Analytics</strong> with{" "}
            <strong>Consent Mode v2 (advanced)</strong>: the tag loads on every
            visit but sends <em>cookieless, anonymous pings</em> until you
            consent — Google then uses AI modelling to estimate aggregate
            traffic without identifying you. If you click "Accept analytics",
            full measurement (with cookies) is enabled and we also load{" "}
            <strong>RankSuite</strong> (first-party, hosted on
            affiliateguidance.com). You can withdraw consent any time from the{" "}
            <Link to="/privacy-policy" className="text-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            {" "}page (legal basis: consent, Art. 6(1)(a) GDPR; rights: access,
            rectification, erasure, objection, portability, complaint).
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("granted")}>
              Accept analytics
            </Button>
            <Button size="sm" variant="outline" onClick={() => choose("denied")}>
              Reject analytics
            </Button>
          </div>
        </div>
        <button
          onClick={() => choose("denied")}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
