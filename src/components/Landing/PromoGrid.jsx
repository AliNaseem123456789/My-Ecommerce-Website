import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContentService } from "../../services/content.service";
import "../../styles/ContentCards.css";

const ACCENTS = ["sand", "sage", "mist", "blush", "ink"];

function PromoCard({ promo, index }) {
  const accent = ACCENTS.includes(promo.accent)
    ? promo.accent
    : ACCENTS[index % ACCENTS.length];

  const body = (
    <>
      {promo.badge && <span className="promo-badge">{promo.badge}</span>}
      <h3 className="promo-headline">{promo.headline}</h3>
      {promo.subhead && <p className="promo-subhead">{promo.subhead}</p>}
      {promo.coupon_code && <span className="promo-code">{promo.coupon_code}</span>}
      {promo.fine_print && <p className="promo-fineprint">{promo.fine_print}</p>}
      <div className="promo-spacer" />
      <span className="promo-cta">Shop now &rarr;</span>
      {promo.image_url ? (
        <img
          className="promo-image"
          src={promo.image_url}
          alt=""
          loading="lazy"
          aria-hidden="true"
        />
      ) : (
        // No artwork yet: a soft arc keeps the card from looking unfinished.
        <span className="promo-motif" aria-hidden="true" />
      )}
    </>
  );

  const className = `promo-card promo-card--${accent}`;
  const target = promo.link_url || "/shop";

  return target.startsWith("http") ? (
    <a className={className} href={target} rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link className={className} to={target}>
      {body}
    </Link>
  );
}

/**
 * Offer cards. Each one is a deal, not a product grouping, so the card's
 * content is the offer itself. Renders nothing when no promotion is live.
 */
export default function PromoGrid({ title = "Deals worth a look", subtitle, tinted }) {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    let active = true;
    ContentService.getPromotions()
      .then((rows) => {
        if (active) setPromos(Array.isArray(rows) ? rows.slice(0, 8) : []);
      })
      .catch(() => {
        if (active) setPromos([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (promos.length === 0) return null;

  return (
    <section className={tinted ? "content-section content-section--tinted" : "content-section"}>
      <div className={tinted ? "content-inner" : undefined}>
        <h2 className="content-title">{title}</h2>
        {subtitle && <p className="content-subtitle">{subtitle}</p>}
        <div className="promo-grid">
          {promos.map((promo, index) => (
            <PromoCard key={promo.promotion_id} promo={promo} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
