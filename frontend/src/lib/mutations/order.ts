import { updateOrderStatus } from "$lib/service/order.service";
import type { OrderStatus } from "$lib/types/order.type";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  }));
};
