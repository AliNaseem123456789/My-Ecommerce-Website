import { CategoriesService } from "../services/categories.service";

/**
 * Category id -> name, fetched once per page load and shared by every
 * section that needs it, instead of one request per rail.
 */
let pending = null;

export function getCategoryNames() {
  if (!pending) {
    pending = CategoriesService.getAllCategories()
      .then((rows) =>
        new Map(
          (Array.isArray(rows) ? rows : []).map((row) => [
            row.category_id,
            row.name,
          ]),
        ),
      )
      .catch(() => new Map());
  }
  return pending;
}

export function withCategoryNames(products, names) {
  return (Array.isArray(products) ? products : []).map((product) => ({
    ...product,
    categoryName:
      product.categoryName || names.get(product.category_id) || "Category",
  }));
}
