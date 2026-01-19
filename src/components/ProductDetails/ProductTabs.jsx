import { Tabs, Tab, Box } from "@mui/material";
import styles from "../../styles/productUI.module.css";

function ProductTabs({ value, onChange }) {
  return (
    <Box className={styles.tabsWrapper}>
      <Tabs value={value} onChange={(e, newValue) => onChange(newValue)}>
        <Tab label="Description" />
        <Tab label="Reviews" />
        <Tab label="Questions" />
      </Tabs>
    </Box>
  );
}

export default ProductTabs;
