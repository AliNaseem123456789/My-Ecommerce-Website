import React from "react";
import "../../styles/StaticPages.css";

export default function RefundReturns() {
  return (
    <div className="static-container">
      <h1 className="static-title blue-accent-title">
        Refund and Returns Policy
      </h1>

      <h2 className="static-subtitle">Overview</h2>
      <p className="static-text">
        Our refund and returns policy lasts 30 days. If more than 30 days have
        passed since your purchase, we are unable to offer a full refund or
        exchange.
      </p>

      <h2 className="static-subtitle">Eligibility for Returns</h2>
      <ul className="static-list">
        <li>The item must be unused and in the same condition as received.</li>
        <li>The item must be in its original packaging.</li>
      </ul>

      <h2 className="static-subtitle">Exchanges</h2>
      <p className="static-text">
        We replace items only if they are defective or damaged. Requests for
        exchanges are evaluated on a case-by-case basis.
      </p>

      <h2 className="static-subtitle">Shipping Returns</h2>
      <p className="static-text">
        Customers are responsible for paying their own shipping costs when
        returning items. Shipping fees are non-refundable.
      </p>
    </div>
  );
}
