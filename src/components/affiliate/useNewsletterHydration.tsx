import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import InlineNewsletter, { type NewsletterVariant } from "@/components/affiliate/InlineNewsletter";

const VALID: NewsletterVariant[] = ["default", "card", "gradient", "compact"];

type Mount = {
  el: HTMLElement;
  variant: NewsletterVariant;
  slug?: string;
  title?: string;
  source?: string;
};

/**
 * Scans `containerRef` for `[data-newsletter-mount]` placeholders that were
 * injected via dangerouslySetInnerHTML, then renders <InlineNewsletter />
 * into each one through a React portal. Re-runs whenever `htmlKey` changes.
 */
export function useNewsletterHydration(
  containerRef: React.RefObject<HTMLElement>,
  htmlKey: unknown,
) {
  const [mounts, setMounts] = useState<Mount[]>([]);
  const lastHtmlKey = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (lastHtmlKey.current === htmlKey && mounts.length > 0) return;
    lastHtmlKey.current = htmlKey;

    const nodes = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("[data-newsletter-mount]"),
    );
    const next: Mount[] = nodes.map((el) => {
      const v = (el.dataset.variant || "default") as NewsletterVariant;
      return {
        el,
        variant: VALID.includes(v) ? v : "default",
        slug: el.dataset.slug || undefined,
        title: el.dataset.title || undefined,
        source: el.dataset.source || "inline-prose",
      };
    });
    // Empty the placeholders so server-rendered fallback markup is replaced
    next.forEach((m) => {
      m.el.innerHTML = "";
    });
    setMounts(next);
  }, [containerRef, htmlKey, mounts.length]);

  const portals = mounts.map((m, i) =>
    createPortal(
      <InlineNewsletter
        variant={m.variant}
        source={m.source}
        postSlug={m.slug}
        postTitle={m.title}
        className="!my-0"
      />,
      m.el,
      `nl-${i}`,
    ),
  );

  return <>{portals}</>;
}
