import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styles/LandingProduct.css";

export default function LandingProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const id = product.product_id;

  const createImageUrl = (filename) => {
    try {
      return new URL(`/src/assets/products/${filename}`, import.meta.url).href;
    } catch {
      return null;
    }
  };

  const images = useMemo(() => {
    const imageUrls = [];

    const possibleFiles = [
      `${id}.jpeg`,
      `${id}-1.jpeg`,
      `${id}.jpg`,
      `${id}-1.jpg`,
    ];

    possibleFiles.forEach((file) => {
      const url = createImageUrl(file);
      if (url && !imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    });

    if (imageUrls.length === 0) {
      imageUrls.push("https://via.placeholder.com/300");
    }

    return imageUrls;
  }, [id]);

  const displayedImage = isHovered && images.length > 1 ? images[1] : images[0];

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${id}`} className="product-link">
        <div className="product-image-container">
          <img
            src={displayedImage}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300";
            }}
          />
        </div>
        <div className="product-info">
          <p className="product-category">
            {product.categoryName || "Category"}
          </p>

          <h3 className="product-title">{product.name}</h3>

          <p className="product-price">${product.price}</p>
        </div>
      </Link>
    </div>
  );
}
