import { useEffect, useState } from "react";
import PromoGrid from "./PromoGrid";
import CollectionGrid from "./CollectionGrid";
import BrandStrip from "./BrandStrip";
import CmsProductRail from "./CmsProductRail";
import ShopByPrice from "./ShopByPrice";
import Testimonials from "./Testimonials";
import RecentlyViewed from "../RecentlyViewed";
import { ContentService } from "../../services/content.service";

/**
 * Renders the lower half of the landing page from rows in landing_sections,
 * so order and content are editable in Admin -> Landing page.
 *
 * If the CMS has no rows yet (or the request fails) it falls back to this
 * sensible default layout, so the page is never blank.
 */
const FALLBACK = [
  { section_id: "f1", type: "promo_grid", title: "Deals worth a look" },
  {
    section_id: "f2",
    type: "product_rail",
    title: "Best sellers",
    subtitle: "What everyone else is buying right now.",
    config: { source: "best_sellers", limit: 10 },
  },
  {
    section_id: "f3",
    type: "product_rail",
    title: "New arrivals",
    subtitle: "The latest additions to the shop.",
    config: { source: "new_arrivals", limit: 10, tinted: true },
  },
  { section_id: "f4", type: "collection_grid", title: "Curated for you" },
  { section_id: "f5", type: "shop_by_price" },
  {
    section_id: "f6",
    type: "product_rail",
    title: "Top rated",
    subtitle: "Highest rated by customers who bought them.",
    config: { source: "top_rated", limit: 10 },
  },
  { section_id: "f7", type: "brand_strip", title: "Shop by brand" },
  {
    section_id: "f8",
    type: "product_rail",
    title: "Most wishlisted",
    subtitle: "Saved more than anything else in the store.",
    config: { source: "most_wishlisted", limit: 10, tinted: true },
  },
  { section_id: "f9", type: "testimonials" },
  { section_id: "f10", type: "recently_viewed" },
];

function renderSection(section) {
  const config = section.config || {};
  const tinted = Boolean(config.tinted);

  switch (section.type) {
    case "promo_grid":
      return (
        <PromoGrid
          title={section.title || "Deals worth a look"}
          subtitle={section.subtitle}
          tinted={tinted}
        />
      );
    case "collection_grid":
      return (
        <CollectionGrid
          title={section.title || "Curated for you"}
          subtitle={section.subtitle}
          tinted={tinted}
          limit={config.limit || 4}
        />
      );
    case "brand_strip":
      return (
        <BrandStrip
          title={section.title || "Shop by brand"}
          subtitle={section.subtitle}
          tinted={tinted}
        />
      );
    case "product_rail":
      return (
        <CmsProductRail
          source={config.source || "best_sellers"}
          collectionSlug={config.collection_slug}
          title={section.title}
          subtitle={section.subtitle}
          limit={config.limit || 10}
          tinted={tinted}
        />
      );
    case "shop_by_price":
      return <ShopByPrice />;
    case "testimonials":
      return <Testimonials />;
    case "recently_viewed":
      return <RecentlyViewed />;
    default:
      return null;
  }
}

export default function LandingSections() {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    let active = true;
    ContentService.getLandingSections()
      .then((rows) => {
        if (!active) return;
        setSections(Array.isArray(rows) && rows.length > 0 ? rows : FALLBACK);
      })
      .catch(() => {
        if (active) setSections(FALLBACK);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!sections) return null;

  return (
    <>
      {sections.map((section) => (
        <div key={section.section_id}>{renderSection(section)}</div>
      ))}
    </>
  );
}
