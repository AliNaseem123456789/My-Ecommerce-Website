import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContentService } from "../../services/content.service";
import "../../styles/ContentCards.css";

/**
 * Editorial cards for curated collections: image, name, short description.
 * Clicking opens the shop filtered to that collection.
 */
export default function CollectionGrid({
  title = "Curated for you",
  subtitle,
  tinted,
  limit = 4,
}) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    let active = true;
    ContentService.getCollections()
      .then((rows) => {
        if (active) setCollections(Array.isArray(rows) ? rows.slice(0, limit) : []);
      })
      .catch(() => {
        if (active) setCollections([]);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  if (collections.length === 0) return null;

  return (
    <section className={tinted ? "content-section content-section--tinted" : "content-section"}>
      <div className={tinted ? "content-inner" : undefined}>
        <h2 className="content-title">{title}</h2>
        {subtitle && <p className="content-subtitle">{subtitle}</p>}

        <div className="collection-grid">
          {collections.map((collection) => {
            const count = collection._count?.collection_products ?? 0;
            return (
              <Link
                key={collection.collection_id}
                to={`/shop?collection=${collection.slug}`}
                className="collection-card"
              >
                <div className="collection-media">
                  {collection.image_url && (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="collection-body">
                  <h3 className="collection-name">
                    {collection.headline || collection.name}
                  </h3>
                  {collection.description && (
                    <p className="collection-desc">{collection.description}</p>
                  )}
                  {count > 0 && (
                    <div className="collection-count">
                      {count} item{count === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
