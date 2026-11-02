import { useEffect, useState } from "react";
import ProductRail from "./ProductRail";
import { LandingService } from "../../services/landing.service";
import { ContentService } from "../../services/content.service";
import { getCategoryNames, withCategoryNames } from "../../utils/categoryNames";

const LOADERS = {
  best_sellers: (limit) => LandingService.getBestSellers(limit),
  new_arrivals: (limit) => LandingService.getNewArrivals(limit),
  top_rated: (limit) => LandingService.getTopRated(limit),
  most_wishlisted: (limit) => LandingService.getMostWishlisted(limit),
};

const DEFAULT_TITLES = {
  best_sellers: "Best sellers",
  new_arrivals: "New arrivals",
  top_rated: "Top rated",
  most_wishlisted: "Most wishlisted",
};

/**
 * A product rail whose contents are chosen by the CMS: either one of the
 * derived sources, or the products of a specific collection.
 */
export default function CmsProductRail({
  source = "best_sellers",
  collectionSlug,
  title,
  subtitle,
  limit = 10,
  tinted = false,
  viewAllTo,
}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const rows =
          source === "collection" && collectionSlug
            ? (await ContentService.getCollection(collectionSlug))?.products
            : await (LOADERS[source] || LOADERS.best_sellers)(limit);

        const names = await getCategoryNames();
        if (active) {
          setProducts(withCategoryNames(rows, names).slice(0, limit));
        }
      } catch {
        if (active) setProducts([]);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [source, collectionSlug, limit]);

  return (
    <ProductRail
      title={title || DEFAULT_TITLES[source] || "Products"}
      subtitle={subtitle}
      products={products}
      tinted={tinted}
      viewAllTo={
        viewAllTo ||
        (source === "collection" && collectionSlug
          ? `/shop?collection=${collectionSlug}`
          : "/shop")
      }
      renderBadge={
        source === "top_rated"
          ? (product) =>
              product.review_count
                ? `${Number(product.avg_rating ?? 0).toFixed(1)} ★ · ${product.review_count} review${
                    product.review_count === 1 ? "" : "s"
                  }`
                : null
          : undefined
      }
    />
  );
}
