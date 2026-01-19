import React, { useContext, useState } from "react";
import { FaTimes, FaRegStar, FaStar } from "react-icons/fa";
import { WishlistContext } from "./context/WishlistContext";

export default function QuickViewModal({ product, onClose }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const [hoverStar, setHoverStar] = useState(false);

  const id = product.product_id;

  const getLocalImage = (id) => {
    try {
      return new URL(`/src/assets/products/${id}.jpeg`, import.meta.url).href;
    } catch {
      return "https://via.placeholder.com/400";
    }
  };

  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} size={18} color="#facc15" />);
    }
    if (halfStar) {
      stars.push(<FaStar key="half" size={18} color="#facc15" opacity={0.5} />);
    }

    return stars;
  };

  const isWishlisted = wishlist.includes(id);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "75%",
          maxWidth: "900px",
          background: "white",
          borderRadius: "12px",
          display: "flex",
          padding: "25px",
          position: "relative",
        }}
      >
        {}
        <FaTimes
          size={22}
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            cursor: "pointer",
          }}
        />

        {}
        <div style={{ flex: 1, paddingRight: "20px" }}>
          <img
            src={getLocalImage(id)}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />
        </div>

        {}
        <div style={{ flex: 1.4, paddingLeft: "10px" }}>
          {}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                margin: 0,
                maxWidth: "80%",
              }}
            >
              {product.name}
            </h2>

            {}
            <div
              style={{
                background: "white",
                padding: "8px",
                borderRadius: "50%",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                cursor: "pointer",
                position: "relative",
                transition: "0.2s",
                transform: hoverStar ? "scale(1.1)" : "scale(1)",
              }}
              onMouseEnter={() => setHoverStar(true)}
              onMouseLeave={() => setHoverStar(false)}
              onClick={() => toggleWishlist(id)}
            >
              {}
              {hoverStar && (
                <div
                  style={{
                    position: "absolute",
                    top: "-28px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "black",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                </div>
              )}

              {isWishlisted ? (
                <FaStar size={20} color="#facc15" />
              ) : (
                <FaRegStar size={20} color="gray" />
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ fontSize: "22px", color: "#ef4444", margin: 0 }}>
              ${product.price}
            </h3>

            <div style={{ display: "flex", gap: "4px" }}>
              {renderStars(product.avg_rating)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
