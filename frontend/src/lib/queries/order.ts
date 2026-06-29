import {
  getAdminOrders,
  type GetOrdersParams,
} from "$lib/service/order.service";
import { createQuery } from "@tanstack/svelte-query";

export const useAdminOrders = (params: () => GetOrdersParams) =>
  createQuery(() => ({
    queryKey: ["admin-orders", params()],
    queryFn: () => getAdminOrders(params()),
  }));
