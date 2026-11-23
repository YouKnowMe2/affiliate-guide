import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SHORTCODES, type ShortcodeKey } from "./shortcodes";

type Mount = { el: HTMLElement; key: ShortcodeKey };

/**
 * Scans `containerRef` for `[data-shortcode-mount]` placeholders injected by
 * `parseShortcodes`, then renders the matching React component into each via
 * a portal. Re-runs whenever `htmlKey` changes.
 *
 * Also unwraps placeholders that ended up inside a `<p>` so the rendered
 * widget doesn't sit inside an inline paragraph context.
 */
export function useShortcodeHydration(
  containerRef: React.RefObject<HTMLElement>,
  htmlKey: unknown,
) {
  const [mounts, setMounts] = useState<Mount[]>([]);
  const lastKey = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (lastKey.current === htmlKey && mounts.length > 0) return;
    lastKey.current = htmlKey;

    const root = containerRef.current;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-shortcode-mount]"));

    // If a mount is inside a <p>, hoist it out so block-level children render cleanly.
    nodes.forEach((el) => {
      const p = el.closest("p");
      if (p && p.parentNode) {
        p.parentNode.insertBefore(el, p.nextSibling);
        // remove parent if empty
        if (!p.textContent?.trim() && p.children.length === 0) p.remove();
      }
      el.innerHTML = "";
    });

    const next: Mount[] = nodes
      .map((el) => {
        const key = el.dataset.shortcode as ShortcodeKey | undefined;
        if (!key || !(key in SHORTCODES)) return null;
        return { el, key };
      })
      .filter((m): m is Mount => m !== null);

    setMounts(next);
  }, [containerRef, htmlKey, mounts.length]);

  const portals = mounts.map((m, i) => {
    const Cmp = SHORTCODES[m.key];
    return createPortal(<Cmp />, m.el, `sc-${m.key}-${i}`);
  });

  return <>{portals}</>;
}
