import React from "react";
import { Link, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import styles from "../styles/components.module.css";

export default function Breadcrumbs({ productName }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    "": "Home",
    shop: "Products",
    cart: "Cart",
    wishlist: "Wishlist",
    product: "Product",
    "about-us": "About Us",
    "privacy-policy": "Privacy Policy",
    "terms-and-conditions": "Terms & Conditions",
    "contact-us": "Contact Us",
    "refund-returns": "Refund & Returns",
    account: "Account",
    checkout: "Checkout",
    "login-required": "Login Required",
  };

  return (
    <div className={styles.breadcrumbContainer}>
      <Link to="/" className={styles.breadcrumbLink}>
        Home
      </Link>

      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = "/" + pathnames.slice(0, index + 1).join("/");

        let name =
          breadcrumbNameMap[value] ||
          value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        // Fixes (unchanged logic)
        if (value === "product") name = "Products";
        const correctedTo = value === "product" ? "/shop" : to;
        if (isLast && productName) name = productName;

        return (
          <React.Fragment key={to}>
            <span className={styles.breadcrumbSeparator}>{">"}</span>

            {isLast ? (
              <Typography component="span" className={styles.breadcrumbCurrent}>
                {name}
              </Typography>
            ) : (
              <Link to={correctedTo} className={styles.breadcrumbLink}>
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
