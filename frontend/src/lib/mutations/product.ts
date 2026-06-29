import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "$lib/service/product.service";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (formData: FormData) => createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  }));
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  }));
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  }));
};
