import type { Category } from "./category.type";

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: Category;
  variants: ProductVariant[];
  createdAt: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: Category;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
