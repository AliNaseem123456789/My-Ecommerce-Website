import { Button } from "@mui/material";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import styles from "../../styles/productUI.module.css";

function AddToCartButton({ product, quantity = 1 }) {
  const { addToCart } = useContext(CartContext);

  return (
    <Button
      fullWidth
      variant="contained"
      className={styles.addToCartBtn}
      onClick={() => addToCart({ ...product, quantity })}
    >
      ADD TO CART
    </Button>
  );
}

export default AddToCartButton;
