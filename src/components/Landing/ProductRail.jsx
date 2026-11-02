import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LandingProductCard from "./LandingProductCard";
import "../../styles/ProductRail.css";

/**
 * Horizontal product row used by the landing page.
 * Renders nothing when there are no products, so a young catalogue never
 * shows an empty section.
 */
export default function ProductRail({
  title,
  subtitle,
  products,
  viewAllTo,
  viewAllLabel = "View all",
  tinted = false,
  renderBadge,
}) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = Array.isArray(products) ? products : [];

  const syncArrows = () => {
    const node = trackRef.current;
    if (!node) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    setAtStart(node.scrollLeft <= 2);
    setAtEnd(node.scrollLeft >= maxScroll - 2);
  };

  useEffect(() => {
    syncArrows();
    const node = trackRef.current;
    if (!node) return undefined;
    node.addEventListener("scroll", syncArrows, { passive: true });
    window.addEventListener("resize", syncArrows);
    return () => {
      node.removeEventListener("scroll", syncArrows);
      window.removeEventListener("resize", syncArrows);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const scrollBy = (direction) => {
    const node = trackRef.current;
    if (!node) return;
    const card = node.querySelector(".rail-item");
    const step = card ? card.offsetWidth + 16 : node.clientWidth * 0.8;
    node.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section className={tinted ? "rail-section rail-section--tinted" : "rail-section"}>
      <div className={tinted ? "rail-inner" : undefined}>
        <div className="rail-header">
          <h2 className="rail-title">{title}</h2>
          {viewAllTo && (
            <Link to={viewAllTo} className="rail-viewall">
              {viewAllLabel} &rarr;
            </Link>
          )}
        </div>
        {subtitle && <p className="rail-subtitle">{subtitle}</p>}

        <div className="rail-viewport">
          <button
            type="button"
            className="rail-arrow rail-arrow--left"
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label={`Scroll ${title} left`}
          >
            &#8249;
          </button>

          <div className="rail-track" ref={trackRef}>
            {items.map((product) => (
              <div className="rail-item" key={product.product_id}>
                <LandingProductCard product={product} />
                {renderBadge && (
                  <span className="rail-badge">{renderBadge(product)}</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="rail-arrow rail-arrow--right"
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label={`Scroll ${title} right`}
          >
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
}
