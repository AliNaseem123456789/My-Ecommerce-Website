import { IconButton, Typography, Box } from "@mui/material";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import styles from "../../styles/productUI.module.css";

function WishlistButton({ productId, showLabel = false }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const isWishlisted = wishlist.includes(Number(productId));

  return (
    <Box className={styles.wishlist} onClick={() => toggleWishlist(productId)}>
      <IconButton>
        {isWishlisted ? (
          <FaStar size={20} color="#facc15" />
        ) : (
          <FaRegStar size={20} />
        )}
      </IconButton>

      {showLabel && <Typography fontWeight={600}>Wishlist</Typography>}
    </Box>
  );
}

export default WishlistButton;
