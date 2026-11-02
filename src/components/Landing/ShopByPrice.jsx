import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LandingService } from "../../services/landing.service";
import { productImageFrom } from "../../utils/productImage";
import "../../styles/ProductRail.css";

const BANDS = [
  {
    key: "under-25",
    amount: "Under $25",
    label: "Everyday finds",
    to: "/shop?maxPrice=25",
    query: { maxPrice: 25 },
  },
  {
    key: "25-50",
    amount: "$25 – $50",
    label: "The sweet spot",
    to: "/shop?minPrice=25&maxPrice=50",
    query: { minPrice: 25, maxPrice: 50 },
  },
  {
    key: "over-50",
    amount: "$50 & up",
    label: "Something special",
    to: "/shop?minPrice=50",
    query: { minPrice: 50 },
  },
];

export default function ShopByPrice() {
  const [bands, setBands] = useState({});

  useEffect(() => {
    let active = true;

    Promise.all(
      BANDS.map((band) =>
        LandingService.getByPriceBand({ ...band.query, limit: 3 })
          .then((data) => [
            band.key,
            { items: data?.items || [], total: data?.total || 0 },
          ])
          .catch(() => [band.key, { items: [], total: 0 }]),
      ),
    ).then((entries) => {
      if (active) setBands(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, []);

  // Hide the whole section if no band has anything in it.
  const anything = Object.values(bands).some((band) => band.total > 0);
  if (!anything) return null;

  return (
    <section className="rail-section">
      <div className="rail-header">
        <h2 className="rail-title">Shop by price</h2>
      </div>
      <p className="rail-subtitle">Find something that fits the budget.</p>

      <div className="priceband-grid">
        {BANDS.map((band) => {
          const data = bands[band.key] || { items: [], total: 0 };
          if (data.total === 0) return null;

          return (
            <Link key={band.key} to={band.to} className="priceband-tile">
              <div className="priceband-head">
                <div>
                  <div className="priceband-amount">{band.amount}</div>
                  <div className="priceband-label">{band.label}</div>
                </div>
                <span className="priceband-count">
                  {data.total} item{data.total === 1 ? "" : "s"}
                </span>
              </div>

              <div className="priceband-thumbs">
                {data.items.slice(0, 3).map((product) => (
                  <div className="priceband-thumb" key={product.product_id}>
                    <img
                      src={productImageFrom(product)}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              <span className="priceband-cta">Shop {band.amount} &rarr;</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
