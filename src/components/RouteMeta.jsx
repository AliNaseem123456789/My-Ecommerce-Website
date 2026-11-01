import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://my-ecommerce-website-three.vercel.app";

const TITLES = {
  "/": "Shop — everyday goods, delivered",
  "/shop": "Shop all products",
  "/cart": "Your cart",
  "/wishlist": "Your wishlist",
  "/search": "Search",
  "/mobile-search": "Search",
  "/checkout": "Checkout",
  "/account": "Your account",
  "/track-order": "Track an order",
  "/compare": "Compare products",
  "/admin": "Admin",
  "/login-required": "Sign in",
  "/reset-password": "Reset your password",
  "/about-us": "About us",
  "/privacy-policy": "Privacy policy",
  "/terms-and-conditions": "Terms and conditions",
  "/contact-us": "Contact us",
  "/refund-returns": "Refunds and returns",
  "/faq": "FAQ",
};

export default function RouteMeta() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/product/")) return null;
  const title = TITLES[pathname] || "Shop";
  const crumbs = ["Home", ...pathname.split("/").filter(Boolean)];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((name, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: index === 0 ? `${SITE}/` : `${SITE}/${crumbs.slice(1, index + 1).join("/")}`,
    })),
  };
  const organization =
    pathname === "/"
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Shop",
          url: `${SITE}/`,
        }
      : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta
        name="description"
        content="Browse the catalog, compare products, and check out with secure card payment."
      />
      <link rel="canonical" href={`${SITE}${pathname === "/" ? "/" : pathname}`} />
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      {organization ? (
        <script type="application/ld+json">{JSON.stringify(organization)}</script>
      ) : null}
    </Helmet>
  );
}
