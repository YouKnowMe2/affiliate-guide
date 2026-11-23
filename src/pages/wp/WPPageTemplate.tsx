import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePage, type WPPage } from "@/lib/cms";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/SEO";
import NotFound from "../NotFound";
import {
  DEFAULT_TEMPLATE,
  PageTemplate,
  getTemplateBySlug,
} from "./pageTemplates";
import GuideLayout from "./layouts/GuideLayout";
import ReviewsLayout from "./layouts/ReviewsLayout";
import ResourcesLayout from "./layouts/ResourcesLayout";
import ToolsLayout from "./layouts/ToolsLayout";
import TutorialLayout from "./layouts/TutorialLayout";
import AboutLayout from "./layouts/AboutLayout";
import ContactLayout from "./layouts/ContactLayout";
import LegalLayout from "./layouts/LegalLayout";
import DefaultLayout from "./layouts/DefaultLayout";

interface Props {
  slug?: string;
  template?: PageTemplate;
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").trim();

export type LayoutProps = {
  page: WPPage;
  template: Pick<PageTemplate, "variant" | "eyebrow" | "gradient" | "cta" | "icon">;
};

const WPPageTemplate = ({ slug: slugProp, template: tplProp }: Props) => {
  const params = useParams<{ slug?: string }>();
  const slug = slugProp ?? params.slug ?? "";
  const { data, isLoading, isError } = usePage(slug);

  const tpl = useMemo(
    () => tplProp ?? getTemplateBySlug(slug) ?? { ...DEFAULT_TEMPLATE },
    [tplProp, slug],
  );

  if (isLoading) {
    return (
      <main className="container-app py-16">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-14 w-3/4 mb-4" />
        <Skeleton className="h-6 w-2/3 mb-12" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </main>
    );
  }

  if (isError || !data) return <NotFound />;

  const props: LayoutProps = { page: data, template: tpl };
  const seoTitle = data.seo?.title ?? `${stripHtml(data.title)} · Affiliate Guidance`;
  const seoDescription = data.seo?.description ?? data.excerpt;
  const seoCanonical = data.seo?.canonical ?? (tplProp?.path ?? getTemplateBySlug(slug)?.path ?? `/${slug}`);

  const layout = (() => {
    switch (tpl.variant) {
      case "guide":     return <GuideLayout {...props} />;
      case "reviews":   return <ReviewsLayout {...props} />;
      case "resources": return <ResourcesLayout {...props} />;
      case "tools":     return <ToolsLayout {...props} />;
      case "tutorial":  return <TutorialLayout {...props} />;
      case "about":     return <AboutLayout {...props} />;
      case "contact":   return <ContactLayout {...props} />;
      case "legal":     return <LegalLayout {...props} />;
      default:          return <DefaultLayout {...props} />;
    }
  })();

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={data.seo?.keywords}
        canonical={seoCanonical}
        image={data.image}
        robots={data.seo?.robots}
        schemaHead={(data.seo as any)?.schemaHead}
      />
      {layout}
    </>
  );
};

export default WPPageTemplate;
