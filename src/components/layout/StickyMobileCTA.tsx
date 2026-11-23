import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getConsent, onConsentChange } from "@/lib/consent";

const StickyMobileCTA = () => {
  // Hide while the cookie consent dialog is occupying the bottom of the screen.
  const [consentSet, setConsentSet] = useState(true);

  useEffect(() => {
    setConsentSet(getConsent() !== "unset");
    return onConsentChange((rec) => setConsentSet(!!rec));
  }, []);

  if (!consentSet) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background/95 to-transparent"
    >
      <Link
        to="/tools"
        className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-premium-glow text-sm"
      >
        Best Tools দেখুন
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default StickyMobileCTA;
