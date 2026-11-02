import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContentService } from "../../services/content.service";
import "../../styles/ContentCards.css";

/** Logo wall for featured brands. Falls back to the brand name when no logo. */
export default function BrandStrip({ title = "Shop by brand", subtitle, tinted }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;
    ContentService.getBrands(true)
      .then((rows) => {
        if (active) setBrands(Array.isArray(rows) ? rows.slice(0, 12) : []);
      })
      .catch(() => {
        if (active) setBrands([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className={tinted ? "content-section content-section--tinted" : "content-section"}>
      <div className={tinted ? "content-inner" : undefined}>
        <h2 className="content-title">{title}</h2>
        {subtitle && <p className="content-subtitle">{subtitle}</p>}

        <div className="brand-strip">
          {brands.map((brand) => (
            <Link
              key={brand.brand_id}
              to={`/shop?brand=${brand.slug}`}
              className="brand-tile"
              title={brand.name}
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} loading="lazy" />
              ) : (
                brand.name
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
