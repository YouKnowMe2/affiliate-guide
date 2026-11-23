import { Link } from "react-router-dom";
import { Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Compact sidebar/inline CTA card teasing sponsored-content offering.
 * Routes users to the dedicated /sponsored page where the full inquiry
 * form lives.
 */
const SponsoredCTACard = ({ className = "" }: { className?: string }) => (
  <aside
    className={`relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-primary/5 p-5 mx-0 my-0 ${className}`}
    data-analytics="cta-impression"
    data-cta-source="sidebar-sponsored"
  >
    <div className="flex items-start gap-3 mb-3">
      <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent grid place-items-center shrink-0">
        <Megaphone className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-accent font-bold mb-0.5">
          For Brands
        </p>
        <h4 className="font-display text-sm font-bold leading-tight font-bangla">
          আপনার ব্র্যান্ডকে hosting / SEO পাঠকদের সামনে তুলে ধরুন
        </h4>
      </div>
    </div>
    <p className="text-xs text-muted-foreground font-bangla mb-3 leading-relaxed">
      Sponsored review, link insertion ও newsletter shoutout — সবই available।
    </p>
    <Button asChild variant="cta" size="sm" className="w-full">
      <Link
        to="/sponsored"
        data-analytics="cta-click"
        data-cta-source="sidebar-sponsored"
      >
        Get sponsorship details <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Button>
  </aside>
);

export default SponsoredCTACard;
