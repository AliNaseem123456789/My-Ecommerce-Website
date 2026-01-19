import React, { useState } from "react";
import { IoRemoveOutline } from "react-icons/io5";
import { Typography } from "@mui/material";
import styles from "../styles/components.module.css";

export default function CategoryFilter({
  categories,
  selectedCategories,
  setSelectedCategories,
}) {
  const [openCat, setOpenCat] = useState(true);

  const toggleCategory = (catID) => {
    if (selectedCategories.includes(catID)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catID));
    } else {
      setSelectedCategories([...selectedCategories, catID]);
    }
  };

  return (
    <div className={styles.categoryFilter}>
      <Typography variant="h4" className={styles.filterTitle}>
        Filters
      </Typography>
      <div
        className={styles.categoryHeader}
        onClick={() => setOpenCat(!openCat)}
      >
        <Typography variant="h6" className={styles.categoryHeaderTitle}>
          Categories
        </Typography>
        <IoRemoveOutline size={22} />
      </div>

      {openCat && (
        <ul className={styles.categoryList}>
          <li
            onClick={() => setSelectedCategories([])}
            className={styles.categoryItem}
          >
            <Typography
              className={
                selectedCategories.length === 0
                  ? styles.categoryActive
                  : styles.categoryInactive
              }
            >
              All
            </Typography>
          </li>

          {/* CATEGORY LIST */}
          {categories.map((cat) => (
            <li
              key={cat.category_id}
              onClick={() => toggleCategory(cat.category_id)}
              className={styles.categoryItem}
            >
              <Typography
                className={
                  selectedCategories.includes(cat.category_id)
                    ? styles.categoryActive
                    : styles.categoryInactive
                }
              >
                {cat.name}
              </Typography>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
