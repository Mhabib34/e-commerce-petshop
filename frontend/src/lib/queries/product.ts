import {
  getProducts,
  type GetProductsParams,
} from "$lib/service/product.service";
import { createQuery } from "@tanstack/svelte-query";

export const useProducts = (params: () => GetProductsParams) =>
  createQuery(() => ({
    queryKey: ["products", params()],
    queryFn: () => getProducts(params()),
  }));
